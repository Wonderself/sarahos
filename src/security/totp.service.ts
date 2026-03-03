/**
 * SARAH OS — TOTP (Time-based One-Time Password) Service
 * Implements RFC 6238 TOTP using Node.js crypto (no external dependencies).
 */

import crypto from 'crypto';

// ── Base32 Encoding / Decoding ──

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encode a Buffer to a Base32 string (RFC 4648).
 */
function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let result = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]!;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >>> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  return result;
}

/**
 * Decode a Base32 string to a Buffer.
 */
function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.replace(/[=\s]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]!);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${cleaned[i]}`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }

  return Buffer.from(bytes);
}

// ── HOTP / TOTP Core ──

/**
 * Generate an HMAC-based One-Time Password (HOTP) per RFC 4226.
 *
 * @param secret - The shared secret as a Buffer
 * @param counter - The counter value (8-byte big-endian)
 * @param digits - Number of digits in the OTP (default 6)
 * @returns The OTP as a zero-padded string
 */
function generateHOTP(secret: Buffer, counter: bigint, digits: number = 6): string {
  // Convert counter to 8-byte big-endian buffer
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);

  // HMAC-SHA1
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Dynamic truncation (RFC 4226 Section 5.4)
  const offset = hash[hash.length - 1]! & 0x0f;
  const binary =
    ((hash[offset]! & 0x7f) << 24) |
    ((hash[offset + 1]! & 0xff) << 16) |
    ((hash[offset + 2]! & 0xff) << 8) |
    (hash[offset + 3]! & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Generate a TOTP code for the given secret at the current (or specified) time.
 *
 * @param secret - Base32-encoded secret string
 * @param timeStepSeconds - Time step in seconds (default 30)
 * @param digits - Number of digits (default 6)
 * @param timestamp - Override timestamp in milliseconds (default Date.now())
 */
function generateTOTP(
  secret: string,
  timeStepSeconds: number = 30,
  digits: number = 6,
  timestamp?: number,
): string {
  const secretBuffer = base32Decode(secret);
  const time = timestamp ?? Date.now();
  const counter = BigInt(Math.floor(time / 1000 / timeStepSeconds));
  return generateHOTP(secretBuffer, counter, digits);
}

// ── TOTP Service ──

export interface TOTPSecret {
  /** Base32-encoded secret */
  secret: string;
  /** otpauth:// URI for authenticator apps */
  otpAuthUrl: string;
  /** Data URL (otpauth:// URI that can be rendered as QR) */
  qrCodeDataUrl: string;
}

export class TOTPService {
  private readonly issuer = 'SARAH OS';
  private readonly digits = 6;
  private readonly period = 30; // seconds
  private readonly stepTolerance = 1; // allow +/- 1 time step

  /**
   * Generate a new TOTP secret for the given user email.
   * Returns the Base32 secret, otpauth URI, and a QR code data URL.
   */
  generateSecret(email: string): TOTPSecret {
    // Generate a 20-byte (160-bit) random secret
    const secretBuffer = crypto.randomBytes(20);
    const secret = base32Encode(secretBuffer);

    // Build otpauth:// URI (RFC 6238 / Google Authenticator compatible)
    const encodedIssuer = encodeURIComponent(this.issuer);
    const encodedEmail = encodeURIComponent(email);
    const otpAuthUrl =
      `otpauth://totp/${encodedIssuer}:${encodedEmail}` +
      `?secret=${secret}` +
      `&issuer=${encodedIssuer}` +
      `&algorithm=SHA1` +
      `&digits=${this.digits}` +
      `&period=${this.period}`;

    // For now, the QR code data URL is the otpauth:// URI itself.
    // In production, this would be rendered to an actual QR image.
    const qrCodeDataUrl = otpAuthUrl;

    return { secret, otpAuthUrl, qrCodeDataUrl };
  }

  /**
   * Verify a 6-digit TOTP token against the given secret.
   * Allows a tolerance of +/- 1 time step (30 seconds) to account for clock drift.
   *
   * @param secret - Base32-encoded secret
   * @param token - 6-digit token from the user
   * @returns true if the token is valid within the tolerance window
   */
  verifyToken(secret: string, token: string): boolean {
    // Sanitize the token
    const cleanToken = token.replace(/\s/g, '');
    if (cleanToken.length !== this.digits || !/^\d+$/.test(cleanToken)) {
      return false;
    }

    const now = Date.now();

    // Check current time step and +/- tolerance steps
    for (let step = -this.stepTolerance; step <= this.stepTolerance; step++) {
      const adjustedTime = now + step * this.period * 1000;
      const expectedToken = generateTOTP(secret, this.period, this.digits, adjustedTime);

      // Constant-time comparison to prevent timing attacks
      if (
        cleanToken.length === expectedToken.length &&
        crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expectedToken))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate a set of single-use backup/recovery codes.
   *
   * @param count - Number of backup codes to generate (default 8)
   * @returns Array of 8-character alphanumeric recovery codes
   */
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < count; i++) {
      const bytes = crypto.randomBytes(8);
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += charset[bytes[j]! % charset.length];
      }
      codes.push(code);
    }

    return codes;
  }

  /**
   * Validate a backup code against the stored list.
   * Backup codes are single-use: if valid, the code is removed from the stored list.
   *
   * @param code - The backup code provided by the user
   * @param storedCodes - The array of remaining valid backup codes
   * @returns true if the code was valid (and has been consumed from storedCodes)
   */
  validateBackupCode(code: string, storedCodes: string[]): boolean {
    const normalizedCode = code.toLowerCase().replace(/[\s-]/g, '');

    const index = storedCodes.findIndex((stored) => {
      const normalizedStored = stored.toLowerCase().replace(/[\s-]/g, '');
      // Constant-time comparison
      if (normalizedCode.length !== normalizedStored.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(normalizedCode),
        Buffer.from(normalizedStored),
      );
    });

    if (index === -1) {
      return false;
    }

    // Remove the used code (single-use)
    storedCodes.splice(index, 1);
    return true;
  }
}

/** Singleton TOTP service instance */
export const totpService = new TOTPService();
