import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import type { DashboardSummary } from '../../types/api/dashboard';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/',
      providesTags: [API_TAGS.DASHBOARD],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
