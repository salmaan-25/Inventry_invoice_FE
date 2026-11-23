import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import { handleBlobResponse } from '../../utils/download';
import type { Paginated } from '../../types/api/common';
import type {
  Invoice,
  InvoiceListItem,
  InvoiceCalculation,
  CalculateInvoiceRequest,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceListParams,
  AwaitingDispatchItem,
} from '../../types/api/invoice';

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    calculateInvoice: builder.mutation<InvoiceCalculation, CalculateInvoiceRequest>({
      query: (body) => ({
        url: '/invoices/calculate/',
        method: 'POST',
        body,
      }),
    }),
    getInvoices: builder.query<Paginated<InvoiceListItem>, InvoiceListParams | void>({
      query: (params) => ({
        url: '/invoices/',
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.INVOICE],
    }),
    getInvoice: builder.query<Invoice, number | string>({
      query: (id) => `/invoices/${id}/`,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.INVOICE, id }],
    }),
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({
        url: '/invoices/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.INVOICE, API_TAGS.DASHBOARD],
    }),
    updateInvoice: builder.mutation<Invoice, UpdateInvoiceRequest>({
      query: ({ id, ...body }) => ({
        url: `/invoices/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.INVOICE,
        { type: API_TAGS.INVOICE, id },
      ],
    }),
    issueInvoice: builder.mutation<Invoice, number | string>({
      query: (id) => ({
        url: `/invoices/${id}/issue/`,
        method: 'POST',
        body: {},
      }),
      invalidatesTags: [
        API_TAGS.INVOICE,
        API_TAGS.PRODUCT,
        API_TAGS.STOCK_MOVEMENT,
        API_TAGS.OPEN_INVOICES,
        API_TAGS.CUSTOMER_STATEMENT,
        API_TAGS.AWAITING_DISPATCH,
        API_TAGS.DASHBOARD,
      ],
    }),
    getInvoiceDocumentBlob: builder.query<Blob, number | string>({
      query: (id) => ({
        url: `/invoices/${id}/document/`,
        responseHandler: handleBlobResponse,
      }),
    }),
    getAwaitingDispatch: builder.query<AwaitingDispatchItem[], number | string>({
      query: (id) => `/invoices/${id}/awaiting-dispatch/`,
      providesTags: [API_TAGS.AWAITING_DISPATCH],
    }),
  }),
});

export const {
  useCalculateInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useIssueInvoiceMutation,
  useLazyGetInvoiceDocumentBlobQuery,
  useGetAwaitingDispatchQuery,
} = invoicesApi;
