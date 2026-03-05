/**
 * Centralized client-side API utilities.
 * Used by all 'use client' components that need to call the backend directly.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export function getToken(): string {
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? '';
  } catch {
    return '';
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, string>).error ?? `API ${res.status}`);
  }
  return res.json();
}
