import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { APP_CONFIG } from '../../constants/config';
import { ALL_API_TAGS } from '../../constants/tags';
import { readCsrfToken } from '../../utils/csrf';
import { sessionExpired } from '../slice/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: APP_CONFIG.apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { endpoint, type }) => {
    // Only attach CSRF token for mutations or unsafe methods
    if (type === 'mutation' || endpoint.toLowerCase().includes('login') || endpoint.toLowerCase().includes('logout')) {
      const csrfToken = readCsrfToken();
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
      }
    }
    // Do not set Content-Type header manually so FormData can set its boundary
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    // If error data is a Blob (e.g. from file download / export failures), unpack it as JSON or text
    if (
      result.error &&
      'data' in result.error &&
      result.error.data &&
      typeof result.error.data === 'object' &&
      (result.error.data instanceof Blob ||
        Object.prototype.toString.call(result.error.data) === '[object Blob]' ||
        ('size' in result.error.data && 'type' in result.error.data))
    ) {
      try {
        const blob = result.error.data as unknown as { text?: () => Promise<string> };
        let text = '';
        if (typeof blob.text === 'function') {
          text = await blob.text();
        } else if (typeof FileReader !== 'undefined') {
          text = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => resolve('');
            reader.readAsText(result.error.data as Blob);
          });
        }
        if (text.trim() !== '') {
          try {
            (result.error as { data: unknown }).data = JSON.parse(text);
          } catch {
            (result.error as { data: unknown }).data = text;
          }
        }
      } catch {
        // Leave unchanged if unreadable
      }
    }

    const url = typeof args === 'string' ? args : (args && 'url' in args ? args.url : '');
    const isPublicOrAuthEndpoint =
      url.includes('/auth/login/') ||
      url.includes('/auth/me/') ||
      url.includes('/auth/csrf/') ||
      url.includes('/company/');

    // Handle 401 session expiration, excluding initial auth checks, login, and company branding
    if (result.error.status === 401 && !isPublicOrAuthEndpoint) {
      api.dispatch(sessionExpired());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ALL_API_TAGS,
  endpoints: () => ({}),
});
