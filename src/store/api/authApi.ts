import { baseApi } from './baseApi';
import { API_TAGS, ALL_API_TAGS } from '../../constants/tags';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  CsrfResponse,
  LogoutResponse,
} from '../../types/api/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCsrf: builder.query<CsrfResponse, void>({
      query: () => '/auth/csrf/',
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me/',
      providesTags: [API_TAGS.AUTH],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [API_TAGS.AUTH],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout/',
        method: 'POST',
      }),
      invalidatesTags: ALL_API_TAGS,
    }),
  }),
});

export const {
  useGetCsrfQuery,
  useLazyGetCsrfQuery,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
