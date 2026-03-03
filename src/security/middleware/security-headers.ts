/**
 * SARAH OS — Security Headers Middleware
 * Sets security-related HTTP headers and provides CORS configuration.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

// ── Security Headers Middleware ──

/**
 * Express middleware that sets comprehensive security headers on every response.
 *
 * Headers applied:
 * - Content-Security-Policy (CSP) — restricts resource loading origins
 * - X-Content-Type-Options — prevents MIME-type sniffing
 * - X-Frame-Options — prevents clickjacking via framing
 * - X-XSS-Protection — disabled (CSP supersedes this deprecated header)
 * - Referrer-Policy — controls referrer information sent with requests
 * - Permissions-Policy — restricts browser feature access
 * - Strict-Transport-Security — enforces HTTPS connections
 */
export const securityHeaders: RequestHandler = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Content Security Policy
  // script-src 'unsafe-inline' is needed for Next.js inline scripts
  // style-src 'unsafe-inline' is needed for styled-jsx and inline styles
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "font-src 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent the page from being framed (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS Protection — set to 0 because the header is deprecated
  // and CSP provides superior protection. Some browsers misbehave
  // when this is enabled, so disabling is the modern recommendation.
  res.setHeader('X-XSS-Protection', '0');

  // Referrer Policy — send origin only on cross-origin, full URL on same-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy — restrict access to sensitive browser APIs
  // camera=() disables camera, microphone=(self) allows for voice features,
  // geolocation=() disables geolocation
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  // HTTP Strict Transport Security — enforce HTTPS for 1 year including subdomains
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
};

// ── CORS Middleware ──

/**
 * Creates a CORS middleware that validates the request Origin header
 * against a list of allowed origins.
 *
 * - Preflight (OPTIONS) requests are handled with a 204 response.
 * - Non-matching origins receive no CORS headers (browser will block).
 *
 * @param allowedOrigins - Array of allowed origin strings (e.g., ['https://app.sarah-os.com'])
 */
export function corsMiddleware(allowedOrigins: string[]): RequestHandler {
  const originsSet = new Set(allowedOrigins.map((o) => o.toLowerCase().replace(/\/$/, '')));

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin && originsSet.has(requestOrigin.toLowerCase().replace(/\/$/, ''))) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Request-Id',
      );
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}
