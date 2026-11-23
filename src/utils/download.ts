/**
 * Triggers a browser download for a Blob and immediately revokes the object URL.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Opens a Blob in a new browser tab and revokes the URL after a short timeout.
 */
export function openBlobInNewTab(blob: Blob): void {
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 10000);
}

/**
 * Safe response handler for file downloads/exports in RTK Query.
 * Returns the Blob on successful status codes, or parses the JSON/text error body on HTTP failure
 * so that API error messages are never hidden inside binary Blob objects.
 */
export async function handleBlobResponse(response: Response): Promise<Blob | unknown> {
  if (!response.ok) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return response.blob();
}
