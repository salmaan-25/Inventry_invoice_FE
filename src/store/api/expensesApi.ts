import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import { handleBlobResponse } from '../../utils/download';
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseCategoryRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseListResponse,
  ExpenseListParams,
} from '../../types/api/expense';

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategories: builder.query<ExpenseCategory[], void>({
      query: () => '/expense-categories/',
      providesTags: [API_TAGS.EXPENSE_CATEGORY],
    }),
    createExpenseCategory: builder.mutation<ExpenseCategory, CreateExpenseCategoryRequest>({
      query: (body) => ({
        url: '/expense-categories/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.EXPENSE_CATEGORY],
    }),
    getExpenses: builder.query<ExpenseListResponse, ExpenseListParams | void>({
      query: (params) => ({
        url: '/expenses/',
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.EXPENSE],
    }),
    getExpense: builder.query<Expense, number | string>({
      query: (id) => `/expenses/${id}/`,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.EXPENSE, id }],
    }),
    createExpense: builder.mutation<Expense, CreateExpenseRequest>({
      query: (body) => ({
        url: '/expenses/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.EXPENSE, API_TAGS.DASHBOARD],
    }),
    updateExpense: builder.mutation<Expense, UpdateExpenseRequest>({
      query: ({ id, ...body }) => ({
        url: `/expenses/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.EXPENSE,
        { type: API_TAGS.EXPENSE, id },
        API_TAGS.DASHBOARD,
      ],
    }),
    getExpenseExportBlob: builder.query<Blob, { from?: string; to?: string }>({
      query: (params) => ({
        url: '/expenses/export/',
        params: buildQueryParams(params),
        responseHandler: handleBlobResponse,
      }),
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useLazyGetExpenseExportBlobQuery,
} = expensesApi;
