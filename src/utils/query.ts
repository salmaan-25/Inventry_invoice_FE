/**
 * Filters out undefined, null, and empty string parameters for clean URL query generation.
 */
export function buildQueryParams(
  params: object
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        clean[key] = trimmed;
      }
      continue;
    }
    if (typeof value === 'number') {
      if (!Number.isNaN(value)) {
        clean[key] = value;
      }
      continue;
    }
    if (typeof value === 'boolean') {
      clean[key] = value;
      continue;
    }
  }

  return clean;
}
