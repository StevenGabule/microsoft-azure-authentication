/**
 * In-memory token storage.
 * Access tokens are NEVER stored in localStorage/sessionStorage.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}

/**
 * Checks if a JWT token is expired.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() >= expiry - 30000; // 30s buffer
  } catch {
    return true;
  }
}

/**
 * Extracts the payload from a JWT token.
 */
export function parseToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
