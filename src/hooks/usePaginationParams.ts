import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';

export interface PaginationState {
  page: number;
  pageSize: number;
  search: string;
}

export function usePaginationParams(defaultPageSize = DEFAULT_PAGE_SIZE) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const p = Number(searchParams.get('page'));
    return !Number.isNaN(p) && p > 0 ? p : 1;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const s = Number(searchParams.get('page_size'));
    return !Number.isNaN(s) && s > 0 ? s : defaultPageSize;
  }, [searchParams, defaultPageSize]);

  const search = useMemo(() => {
    return searchParams.get('search') ?? '';
  }, [searchParams]);

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(newPage));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page_size', String(newPageSize));
          next.set('page', '1'); // Reset to first page
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newSearch.trim()) {
            next.set('search', newSearch.trim());
          } else {
            next.delete('search');
          }
          next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return {
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
  };
}
