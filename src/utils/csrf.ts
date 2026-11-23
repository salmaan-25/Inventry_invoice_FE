/**
 * Reads the csrftoken cookie value for Django CSRF protection.
 */
export function readCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? (match[1] ?? null) : null;
}
