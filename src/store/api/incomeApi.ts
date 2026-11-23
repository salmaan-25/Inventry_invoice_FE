import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import { handleBlobResponse } from '../../utils/download';
import type {
  OtherIncome,
  IncomeCategory,
  CreateIncomeCategoryRequest,
  CreateOtherIncomeRequest,
  UpdateOtherIncomeRequest,
  IncomeListResponse,
  IncomeListParams,
} from '../../types/api/income';

export const incomeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeCategories: builder.query<IncomeCategory[], void>({
      query: () => '/income-categories/',
      providesTags: [API_TAGS.INCOME_CATEGORY],
    }),
    createIncomeCategory: builder.mutation<IncomeCategory, CreateIncomeCategoryRequest>({
      query: (body) => ({
        url: '/income-categories/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.INCOME_CATEGORY],
    }),
    getOtherIncomes: builder.query<IncomeListResponse, IncomeListParams | void>({
      query: (params) => ({
        url: '/other-income/',
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.INCOME],
    }),
    getOtherIncome: builder.query<OtherIncome, number | string>({
      query: (id) => `/other-income/${id}/`,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.INCOME, id }],
    }),
    createOtherIncome: builder.mutation<OtherIncome, CreateOtherIncomeRequest>({
      query: (body) => ({
        url: '/other-income/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.INCOME, API_TAGS.DASHBOARD],
    }),
    updateOtherIncome: builder.mutation<OtherIncome, UpdateOtherIncomeRequest>({
      query: ({ id, ...body }) => ({
        url: `/other-income/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.INCOME,
        { type: API_TAGS.INCOME, id },
        API_TAGS.DASHBOARD,
      ],
    }),
    getIncomeExportBlob: builder.query<Blob, { from?: string; to?: string }>({
      query: (params) => ({
        url: '/other-income/export/',
        params: buildQueryParams(params),
        responseHandler: handleBlobResponse,
      }),
    }),
  }),
});

export const {
  useGetIncomeCategoriesQuery,
  useCreateIncomeCategoryMutation,
  useGetOtherIncomesQuery,
  useGetOtherIncomeQuery,
  useCreateOtherIncomeMutation,
  useUpdateOtherIncomeMutation,
  useLazyGetIncomeExportBlobQuery,
} = incomeApi;
