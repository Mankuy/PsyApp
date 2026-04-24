// Auth utilities for psyapp-saas

import { UserRole } from './types';

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti?: string;      // token id for revocation
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;   // e.g. '15m'
  refreshTokenExpiry: string;  // e.g. '7d'
  issuer?: string;
  audience?: string;
}

const DEFAULT_ACCESS_EXPIRY_MINUTES = 15;
const DEFAULT_REFRESH_EXPIRY_DAYS = 7;

/**
 * Create a JWT payload object.
 */
export function createJwtPayload(
  userId: string,
  email: string,
  role: UserRole,
  expiresInSeconds: number,
  tokenId?: string
): JwtPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: userId,
    email,
    role,
    iat: now,
    exp: now + expiresInSeconds,
    jti: tokenId,
  };
}

/**
 * Parse expiry string like '15m', '7d', '1h' into seconds.
 */
export function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default:
      throw new Error(`Unknown expiry unit: ${unit}`);
  }
}

/**
 * Default token configuration.
 * In production, secrets should come from environment variables.
 */
export function getDefaultTokenConfig(): TokenConfig {
  return {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'default-access-secret-change-me',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-me',
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || `${DEFAULT_ACCESS_EXPIRY_MINUTES}m`,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || `${DEFAULT_REFRESH_EXPIRY_DAYS}d`,
    issuer: process.env.TOKEN_ISSUER || 'psyapp-saas',
    audience: process.env.TOKEN_AUDIENCE || 'psyapp-saas-api',
  };
}

/**
 * Generate a secure random token id (for revocation support).
 * Works in Node.js and modern browsers.
 */
export function generateTokenId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Check if a JWT payload is expired.
 */
export function isTokenExpired(payload: JwtPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Role hierarchy for authorization checks.
 * Higher index = more permissions.
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  patient: 0,
  therapist: 1,
  admin: 2,
};

/**
 * Check if a user's role meets the required role.
 * Uses hierarchy: admin >= therapist >= patient.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has any of the allowed roles.
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.some((role) => hasRole(userRole, role));
}

/**
 * Extract bearer token from Authorization header.
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Base64-url encode a string (for JWT segments).
 */
export function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  // Browser fallback
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64-url decode a string.
 */
export function base64UrlDecode(str: string): string {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
  // Browser fallback
  return atob(base64);
}

/**
 * Decode a JWT payload without verifying the signature.
 * Useful for client-side preview or debugging.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}
