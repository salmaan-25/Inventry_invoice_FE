import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import type { Paginated } from '../../types/api/common';
import type {
  Payment,
  PaymentListItem,
  CreatePaymentRequest,
  PaymentListParams,
} from '../../types/api/payment';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Paginated<PaymentListItem>, PaymentListParams | void>({
      query: (params) => ({
        url: '/payments/',
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.PAYMENT],
    }),
    getPayment: builder.query<Payment, number | string>({
      query: (id) => `/payments/${id}/`,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.PAYMENT, id }],
    }),
    createPayment: builder.mutation<Payment, CreatePaymentRequest>({
      query: (body) => ({
        url: '/payments/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        API_TAGS.PAYMENT,
        API_TAGS.OPEN_INVOICES,
        API_TAGS.INVOICE,
        API_TAGS.CUSTOMER_STATEMENT,
        API_TAGS.DASHBOARD,
      ],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
} = paymentsApi;
