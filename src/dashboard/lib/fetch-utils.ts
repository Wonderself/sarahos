/** Default LLM model used across the dashboard */
export const DEFAULT_LLM_MODEL = 'claude-sonnet-4-20250514';

/**
 * Fetch with timeout using AbortController.
 * Aborts the request if it exceeds the timeout.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
