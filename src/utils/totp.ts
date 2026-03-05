/**
 * TOTP (Time-based One-Time Password) — RFC 6238 / RFC 4226
 * Pure Node.js crypto implementation, no external dependencies.
 */
import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(encoded: string): Buffer {
  const clean = encoded.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  let output = 0;
  const result = Buffer.alloc(Math.ceil(clean.length * 5 / 8));
  for (const char of clean) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      result[output++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return result.slice(0, output);
}

function base32Encode(buf: Buffer): string {
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  for (let i = 0; i < buf.length; i++) {
    buffer = (buffer << 8) | buf[i]!;
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      result += ALPHABET[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  if (bitsLeft > 0) result += ALPHABET[(buffer << (5 - bitsLeft)) & 31];
  return result;
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

function hotp(secret: string, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const code = ((hmac[offset]! & 0x7f) << 24 |
    (hmac[offset + 1]! & 0xff) << 16 |
    (hmac[offset + 2]! & 0xff) << 8 |
    (hmac[offset + 3]! & 0xff)) % 1_000_000;
  return code.toString().padStart(6, '0');
}

export function generateTotp(secret: string, timeStep = 30): string {
  return hotp(secret, Math.floor(Date.now() / 1000 / timeStep));
}

/** Verify with ±1 window (90s tolerance for clock skew) */
export function verifyTotp(secret: string, code: string, timeStep = 30): boolean {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  for (const delta of [-1, 0, 1]) {
    if (hotp(secret, counter + delta) === code.trim()) return true;
  }
  return false;
}

export function buildOtpauthUrl(secret: string, email: string, issuer = 'Freenzy.io'): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: '6', period: '30' });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Generate backup codes (8 × 8-char hex) */
export function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
}
