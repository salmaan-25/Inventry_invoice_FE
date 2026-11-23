import { useState, useCallback } from 'react';
import { saveBlob, openBlobInNewTab } from '../utils/download';
import { useNotify } from './useNotify';
import { resolveApiError } from '../utils/apiError';

export interface UseFileDownloadOptions {
  filename?: string;
  mode?: 'save' | 'open';
}

export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { notifyError } = useNotify();

  const download = useCallback(
    async (
      fetcher: () => Promise<Blob>,
      options: UseFileDownloadOptions = {}
    ): Promise<void> => {
      const { filename = 'download', mode = 'save' } = options;
      setIsDownloading(true);
      try {
        const blob = await fetcher();
        if (mode === 'open') {
          openBlobInNewTab(blob);
        } else {
          saveBlob(blob, filename);
        }
      } catch (err: unknown) {
        const parsed = await resolveApiError(err);
        notifyError(parsed.detail);
      } finally {
        setIsDownloading(false);
      }
    },
    [notifyError]
  );

  return {
    download,
    isDownloading,
  };
}
