import { Router } from 'express';
import crypto from 'crypto';
import { authService } from './auth.service';
import { verifyToken } from './auth.middleware';
import type { AuthenticatedRequest } from './auth.types';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { auditLog } from '../utils/audit-logger';
import { createRateLimitMiddleware } from './rate-limit.middleware';

const SIGNUP_BONUS_MICROCREDITS = 50_000_000; // 50 credits

// Auth-specific rate limits (stricter than global)
const loginRateLimit = createRateLimitMiddleware({ maxRequests: 10, windowMs: 60_000 });
const registerRateLimit = createRateLimitMiddleware({ maxRequests: 5, windowMs: 60_000 });
const passwordResetRateLimit = createRateLimitMiddleware({ maxRequests: 3, windowMs: 60_000 });

export function createAuthRouter(): Router {
  const router = Router();

  // ── Login by API key ──
  router.post('/auth/login', loginRateLimit, async (req, res) => {
    const { apiKey, email, password } = req.body as { apiKey?: string; email?: string; password?: string };

    // Login by email + password
    if (email && password) {
      try {
        const { userRepository } = await import('../users/user.repository');
        const { verifyPassword } = await import('../utils/password');
        const user = await userRepository.findByEmail(email.toLowerCase().trim());
        if (!user) { res.status(401).json({ error: 'Email ou mot de passe incorrect' }); return; }
        if (!user.isActive) { res.status(401).json({ error: 'Compte desactive' }); return; }

        const passwordHash = await userRepository.getPasswordHash(user.id);
        if (!passwordHash) { res.status(401).json({ error: 'Aucun mot de passe defini. Utilisez votre cle API.' }); return; }

        const valid = verifyPassword(password, passwordHash);
        if (!valid) { res.status(401).json({ error: 'Email ou mot de passe incorrect' }); return; }

        await userRepository.updateLastLogin(user.id);
        const token = authService.generateToken(user.email, user.role, { userId: user.id, tier: user.tier });

        // Check onboarding status (best-effort)
        let onboardingCompleted = false;
        try {
          const { userPreferencesRepository } = await import('../users/user-preferences.repository');
          const profile = await userPreferencesRepository.getCompanyProfile(user.id);
          onboardingCompleted = !!(profile && (profile as Record<string, string>)['companyName']);
        } catch { /* best effort */ }

        auditLog({ actor: user.email, action: 'login', resourceType: 'user', resourceId: user.id, ip: req.ip });

        res.json({
          token, expiresIn: '24h', role: user.role,
          userId: user.id, tier: user.tier,
          email: user.email, displayName: user.displayName,
          activeAgents: user.activeAgents,
          userNumber: user.userNumber,
          commissionRate: user.commissionRate,
          referralCode: user.referralCode,
          onboardingCompleted,
        });
      } catch (e) {
        logger.error('Login by email failed', { error: e instanceof Error ? e.message : String(e) });
        res.status(500).json({ error: 'Erreur serveur' });
      }
      return;
    }

    // Login by API key
    if (!apiKey || typeof apiKey !== 'string') {
      res.status(400).json({ error: 'apiKey or email+password is required' });
      return;
    }

    try {
      const result = await authService.loginDual(apiKey);
      if (!result) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
      }
      res.json(result);
    } catch {
      const result = authService.login(apiKey);
      if (!result) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
      }
      res.json(result);
    }
  });

  // ── Register with email + password ──
  router.post('/auth/register', registerRateLimit, async (req, res) => {
    const { email, displayName, password, activeAgents, referredBy } = req.body as { email?: string; displayName?: string; password?: string; activeAgents?: string[]; referredBy?: string };

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      res.status(400).json({ error: 'displayName is required' });
      return;
    }
    if (password && typeof password === 'string') {
      if (password.length < 10) {
        res.status(400).json({ error: 'Le mot de passe doit contenir au moins 10 caracteres' });
        return;
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        res.status(400).json({ error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' });
        return;
      }
    }

    try {
      const { userService } = await import('../users/user.service');
      const { userRepository } = await import('../users/user.repository');
      const cleanEmail = email.toLowerCase().trim();
      const cleanDisplayName = displayName.trim().replace(/<[^>]*>/g, '').slice(0, 100);
      const user = await userService.createUser({
        email: cleanEmail,
        displayName: cleanDisplayName,
        activeAgents: Array.isArray(activeAgents) ? activeAgents : undefined,
        referredBy: typeof referredBy === 'string' ? referredBy : undefined,
      });

      // Store password if provided
      if (password && typeof password === 'string' && password.length >= 10) {
        const { hashPassword } = await import('../utils/password');
        const hash = hashPassword(password);
        await userRepository.setPasswordHash(user.id, hash);
      }

      // Generate email confirmation token
      const confirmToken = crypto.randomBytes(32).toString('hex');
      const confirmExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await userRepository.setEmailConfirmToken(user.id, confirmToken, confirmExpires);

      // Signup bonus: create wallet + deposit credits (using walletService for transaction safety)
      try {
        const { walletService } = await import('../billing/wallet.service');
        const wallet = await walletService.getOrCreateWallet(user.id);
        if (wallet) {
          await walletService.deposit({
            userId: user.id,
            amount: SIGNUP_BONUS_MICROCREDITS,
            description: 'Bonus inscription — 50 credits offerts',
            referenceType: 'signup_bonus',
          });
        }
      } catch (e) {
        logger.warn('Failed to create signup bonus wallet', { userId: user.id, error: e });
      }

      // Send confirmation email (best-effort)
      try {
        const { sendConfirmationEmail } = await import('../notifications/email.service');
        await sendConfirmationEmail(cleanEmail, displayName.trim(), confirmToken);
      } catch (e) {
        logger.warn('Failed to send confirmation email', { email: cleanEmail, error: e });
      }

      // Record referral if applicable
      if (user.referredBy) {
        try {
          const { dbClient: db } = await import('../infra');
          if (db.isConnected()) {
            const referrer = await userRepository.findByReferralCode(user.referredBy);
            if (referrer) {
              await db.query(
                `INSERT INTO referrals (referrer_id, referred_id, referral_code) VALUES ($1, $2, $3) ON CONFLICT (referred_id) DO NOTHING`,
                [referrer.id, user.id, user.referredBy],
              );
              // Notify referrer
              await db.query(
                `INSERT INTO notifications (user_id, channel, type, subject, body, status) VALUES ($1, 'in_app', 'referral_signup', 'Nouveau filleul !', $2, 'pending')`,
                [referrer.id, `${user.displayName} s'est inscrit via votre lien de parrainage !`],
              );
            }
          }
        } catch (e) {
          logger.warn('Failed to record referral', { userId: user.id, referredBy: user.referredBy, error: e });
        }
      }

      // Create default project for multi-project support
      try {
        const { projectService } = await import('../projects/project.service');
        await projectService.ensureDefaultProject(user.id);
      } catch (e) {
        logger.warn('Failed to create default project', { userId: user.id, error: e });
      }

      // Send welcome notification (in-app, best-effort)
      try {
        const { notificationService } = await import('../notifications/notification.service');
        await notificationService.send({
          userId: user.id, channel: 'in_app', type: 'welcome',
          subject: 'Bienvenue chez Freenzy.io !',
          body: `Bonjour ${user.displayName}, bienvenue ! Vous disposez de 50 credits offerts pour decouvrir la plateforme.`,
        });
      } catch (e) {
        logger.warn('Failed to send welcome notification', { userId: user.id, error: e });
      }

      const token = authService.generateToken(user.email, user.role, { userId: user.id, tier: user.tier });

      auditLog({ actor: user.email, action: 'register', resourceType: 'user', resourceId: user.id, ip: req.ip });

      res.status(201).json({
        token, expiresIn: '24h', role: user.role,
        userId: user.id, tier: user.tier,
        email: user.email, displayName: user.displayName,
        activeAgents: user.activeAgents,
        userNumber: user.userNumber,
        commissionRate: user.commissionRate,
        referralCode: user.referralCode,
        onboardingCompleted: false,
        message: 'Compte cree avec succes. Un email de confirmation a ete envoye.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }
      res.status(500).json({ error: error instanceof Error ? error.message : 'Registration failed' });
    }
  });

  // ── Confirm email ──
  router.get('/auth/confirm-email', async (req, res) => {
    const token = req.query['token'] as string;
    if (!token) { res.status(400).json({ error: 'Token requis' }); return; }

    try {
      const { userRepository } = await import('../users/user.repository');
      const confirmed = await userRepository.confirmEmail(token);
      if (!confirmed) {
        res.status(400).json({ error: 'Token invalide ou expire' });
        return;
      }
      // Redirect to dashboard with success
      res.redirect(`${config.APP_URL}/login?emailConfirmed=true`);
    } catch (e) {
      logger.error('Email confirmation failed', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── Forgot password ──
  router.post('/auth/forgot-password', passwordResetRateLimit, async (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Email valide requis' });
      return;
    }

    try {
      const { userRepository } = await import('../users/user.repository');
      const user = await userRepository.findByEmail(email.toLowerCase().trim());

      // Always return success to prevent email enumeration
      if (!user) {
        res.json({ message: 'Si cet email existe, un lien de reinitialisation a ete envoye.' });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await userRepository.setPasswordResetToken(user.id, resetToken, resetExpires);

      try {
        const { sendPasswordResetEmail } = await import('../notifications/email.service');
        await sendPasswordResetEmail(user.email, user.displayName, resetToken);
      } catch (e) {
        logger.warn('Failed to send password reset email', { email: user.email, error: e });
      }

      res.json({ message: 'Si cet email existe, un lien de reinitialisation a ete envoye.' });
    } catch (e) {
      logger.error('Forgot password failed', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── Reset password ──
  router.post('/auth/reset-password', passwordResetRateLimit, async (req, res) => {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password || password.length < 10) {
      res.status(400).json({ error: 'Token et mot de passe (min 10 car.) requis' });
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      res.status(400).json({ error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' });
      return;
    }

    try {
      const { userRepository } = await import('../users/user.repository');
      const { hashPassword } = await import('../utils/password');

      const user = await userRepository.findByPasswordResetToken(token);
      if (!user) {
        res.status(400).json({ error: 'Token invalide ou expire' });
        return;
      }

      const hash = hashPassword(password);
      await userRepository.updatePassword(user.id, hash);
      auditLog({ actor: user.email, action: 'password_reset', resourceType: 'user', resourceId: user.id, ip: req.ip });
      logger.info('Password reset successful', { userId: user.id });

      res.json({ message: 'Mot de passe mis a jour avec succes. Vous pouvez vous connecter.' });
    } catch (e) {
      logger.error('Reset password failed', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── Get current user ──
  router.get('/auth/me', verifyToken, (req: AuthenticatedRequest, res) => {
    res.json({
      sub: req.user!.sub,
      role: req.user!.role,
      userId: req.user!.userId,
      tier: req.user!.tier,
    });
  });

  // ── 2FA: status ──
  router.get('/auth/2fa/status', verifyToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { dbClient: db } = await import('../infra');
      if (!db.isConnected()) { res.json({ enabled: false }); return; }
      const result = await db.query('SELECT totp_enabled FROM users WHERE id = $1', [req.user!.userId]);
      res.json({ enabled: !!(result.rows[0] as { totp_enabled: boolean } | undefined)?.totp_enabled });
    } catch { res.json({ enabled: false }); }
  });

  // ── 2FA: setup (generate secret + QR) ──
  router.post('/auth/2fa/setup', verifyToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { generateTotpSecret, buildOtpauthUrl } = await import('../utils/totp');
      const { dbClient: db } = await import('../infra');
      if (!db.isConnected()) { res.status(503).json({ error: 'DB unavailable' }); return; }

      const email = req.user!.sub;
      const secret = generateTotpSecret();
      const otpauthUrl = buildOtpauthUrl(secret, email);

      // Store unconfirmed secret temporarily
      await db.query(
        'UPDATE users SET totp_secret = $1, totp_enabled = FALSE WHERE id = $2',
        [secret, req.user!.userId],
      );

      // Generate QR code as data URL
      const QRCode = await import('qrcode');
      const qrCode = await QRCode.default.toDataURL(otpauthUrl);

      res.json({ secret, qrCode, otpauthUrl });
    } catch (e) {
      logger.error('2FA setup failed', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── 2FA: confirm (verify code to activate) ──
  router.post('/auth/2fa/confirm', verifyToken, async (req: AuthenticatedRequest, res) => {
    const { code } = req.body as { code?: string };
    if (!code || typeof code !== 'string') { res.status(400).json({ error: 'code requis' }); return; }
    try {
      const { verifyTotp, generateBackupCodes } = await import('../utils/totp');
      const { dbClient: db } = await import('../infra');
      if (!db.isConnected()) { res.status(503).json({ error: 'DB unavailable' }); return; }

      const result = await db.query('SELECT totp_secret FROM users WHERE id = $1', [req.user!.userId]);
      const row = result.rows[0] as { totp_secret: string | null } | undefined;
      if (!row?.totp_secret) { res.status(400).json({ error: '2FA non initialisé. Appelez /auth/2fa/setup d\'abord.' }); return; }

      if (!verifyTotp(row.totp_secret, code)) {
        res.status(400).json({ error: 'Code invalide' });
        return;
      }

      const backupCodes = generateBackupCodes();
      await db.query(
        'UPDATE users SET totp_enabled = TRUE, totp_backup_codes = $1 WHERE id = $2',
        [backupCodes, req.user!.userId],
      );
      auditLog({ actor: req.user!.sub, action: '2fa_enabled', resourceType: 'user', resourceId: req.user!.userId!, ip: req.ip });
      res.json({ enabled: true, backupCodes });
    } catch (e) {
      logger.error('2FA confirm failed', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── 2FA: disable ──
  router.post('/auth/2fa/disable', verifyToken, async (req: AuthenticatedRequest, res) => {
    const { code } = req.body as { code?: string };
    if (!code) { res.status(400).json({ error: 'code requis' }); return; }
    try {
      const { verifyTotp } = await import('../utils/totp');
      const { dbClient: db } = await import('../infra');
      if (!db.isConnected()) { res.status(503).json({ error: 'DB unavailable' }); return; }

      const result = await db.query('SELECT totp_secret, totp_backup_codes FROM users WHERE id = $1', [req.user!.userId]);
      const row = result.rows[0] as { totp_secret: string | null; totp_backup_codes: string[] | null } | undefined;
      if (!row?.totp_secret) { res.status(400).json({ error: '2FA not enabled' }); return; }

      const validTotp = verifyTotp(row.totp_secret, code);
      const validBackup = row.totp_backup_codes?.includes(code.trim().toUpperCase());
      if (!validTotp && !validBackup) { res.status(400).json({ error: 'Code invalide' }); return; }

      await db.query(
        'UPDATE users SET totp_enabled = FALSE, totp_secret = NULL, totp_backup_codes = NULL WHERE id = $1',
        [req.user!.userId],
      );
      auditLog({ actor: req.user!.sub, action: '2fa_disabled', resourceType: 'user', resourceId: req.user!.userId!, ip: req.ip });
      res.json({ enabled: false });
    } catch (e) {
      logger.error('2FA disable failed', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  return router;
}
