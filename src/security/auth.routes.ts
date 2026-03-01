import { Router } from 'express';
import crypto from 'crypto';
import { authService } from './auth.service';
import { verifyToken } from './auth.middleware';
import type { AuthenticatedRequest } from './auth.types';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

const SIGNUP_BONUS_MICROCREDITS = 50_000_000; // 50 credits

export function createAuthRouter(): Router {
  const router = Router();

  // ── Login by API key ──
  router.post('/auth/login', async (req, res) => {
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

        res.json({
          token, expiresIn: '24h', role: user.role,
          userId: user.id, tier: user.tier, apiKey: user.apiKey,
          email: user.email, displayName: user.displayName,
          activeAgents: user.activeAgents,
          userNumber: user.userNumber,
          commissionRate: user.commissionRate,
          referralCode: user.referralCode,
        });
      } catch (e) {
        logger.error('Login by email failed', { error: e });
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
  router.post('/auth/register', async (req, res) => {
    const { email, displayName, password, activeAgents, referredBy } = req.body as { email?: string; displayName?: string; password?: string; activeAgents?: string[]; referredBy?: string };

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      res.status(400).json({ error: 'displayName is required' });
      return;
    }

    try {
      const { userService } = await import('../users/user.service');
      const { userRepository } = await import('../users/user.repository');
      const cleanEmail = email.toLowerCase().trim();
      const user = await userService.createUser({
        email: cleanEmail,
        displayName: displayName.trim(),
        activeAgents: Array.isArray(activeAgents) ? activeAgents : undefined,
        referredBy: typeof referredBy === 'string' ? referredBy : undefined,
      });

      // Store password if provided
      if (password && typeof password === 'string' && password.length >= 6) {
        const { hashPassword } = await import('../utils/password');
        const hash = hashPassword(password);
        await userRepository.setPasswordHash(user.id, hash);
      }

      // Generate email confirmation token
      const confirmToken = crypto.randomBytes(32).toString('hex');
      const confirmExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await userRepository.setEmailConfirmToken(user.id, confirmToken, confirmExpires);

      // Signup bonus: create wallet + deposit credits
      try {
        const { dbClient } = await import('../infra');
        if (dbClient.isConnected()) {
          // Create wallet
          await dbClient.query(
            `INSERT INTO wallets (user_id, balance_credits, total_deposited, currency) VALUES ($1, $2, $2, 'credits') ON CONFLICT (user_id) DO NOTHING`,
            [user.id, SIGNUP_BONUS_MICROCREDITS],
          );
          // Record bonus transaction
          const walletResult = await dbClient.query('SELECT id, balance_credits FROM wallets WHERE user_id = $1', [user.id]);
          if (walletResult.rows[0]) {
            await dbClient.query(
              `INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type) VALUES ($1, $2, 'bonus', $3, $4, 'Bonus inscription — 50 credits offerts', 'signup_bonus')`,
              [walletResult.rows[0]['id'], user.id, SIGNUP_BONUS_MICROCREDITS, walletResult.rows[0]['balance_credits']],
            );
          }
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

      const token = authService.generateToken(user.email, user.role, { userId: user.id, tier: user.tier });

      res.status(201).json({
        token, expiresIn: '24h', role: user.role,
        userId: user.id, tier: user.tier, apiKey: user.apiKey,
        email: user.email, displayName: user.displayName,
        activeAgents: user.activeAgents,
        userNumber: user.userNumber,
        commissionRate: user.commissionRate,
        referralCode: user.referralCode,
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
      logger.error('Email confirmation failed', { error: e });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── Forgot password ──
  router.post('/auth/forgot-password', async (req, res) => {
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
      logger.error('Forgot password failed', { error: e });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // ── Reset password ──
  router.post('/auth/reset-password', async (req, res) => {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password || password.length < 6) {
      res.status(400).json({ error: 'Token et mot de passe (min 6 car.) requis' });
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
      logger.info('Password reset successful', { userId: user.id });

      res.json({ message: 'Mot de passe mis a jour avec succes. Vous pouvez vous connecter.' });
    } catch (e) {
      logger.error('Reset password failed', { error: e });
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

  return router;
}
