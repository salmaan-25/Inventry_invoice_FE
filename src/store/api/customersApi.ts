import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import type { Paginated } from '../../types/api/common';
import type {
  Customer,
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerListParams,
  CustomerOpenInvoice,
  CustomerStatement,
  CustomerStatementParams,
} from '../../types/api/customer';
import type { InvoiceListItem } from '../../types/api/invoice';

function normalizeCustomer(dto: CustomerDto): Customer {
  return {
    ...dto,
    gstin: dto.gstin ?? undefined,
  };
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Paginated<Customer>, CustomerListParams | void>({
      query: (params) => ({
        url: '/customers/',
        params: buildQueryParams(params ?? {}),
      }),
      transformResponse: (res: Paginated<CustomerDto>): Paginated<Customer> => ({
        ...res,
        results: res.results.map(normalizeCustomer),
      }),
      providesTags: [API_TAGS.CUSTOMER],
    }),
    getCustomer: builder.query<Customer, number | string>({
      query: (id) => `/customers/${id}/`,
      transformResponse: normalizeCustomer,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.CUSTOMER, id }],
    }),
    createCustomer: builder.mutation<Customer, CreateCustomerRequest>({
      query: (body) => ({
        url: '/customers/',
        method: 'POST',
        body,
      }),
      transformResponse: normalizeCustomer,
      invalidatesTags: [API_TAGS.CUSTOMER],
    }),
    updateCustomer: builder.mutation<Customer, UpdateCustomerRequest>({
      query: ({ id, ...body }) => ({
        url: `/customers/${id}/`,
        method: 'PATCH',
        body,
      }),
      transformResponse: normalizeCustomer,
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.CUSTOMER,
        { type: API_TAGS.CUSTOMER, id },
        API_TAGS.CUSTOMER_STATEMENT,
        API_TAGS.OPEN_INVOICES,
      ],
    }),
    getCustomerOpenInvoices: builder.query<CustomerOpenInvoice[], number | string>({
      query: (id) => `/customers/${id}/open-invoices/`,
      transformResponse: (
        res: Paginated<Record<string, unknown>> | CustomerOpenInvoice[]
      ): CustomerOpenInvoice[] => {
        const list = Array.isArray(res) ? res : (res?.results ?? []);
        return (list as Record<string, unknown>[]).map((inv) => ({
          id: Number(inv.id),
          invoice_number: String(inv.invoice_number ?? ''),
          invoice_date: String(inv.invoice_date ?? ''),
          grand_total: String(inv.grand_total ?? '0.00'),
          total_paid: String(inv.total_paid ?? inv.paid_amount ?? '0.00'),
          balance_due: String(inv.balance_due ?? '0.00'),
        }));
      },
      providesTags: [API_TAGS.OPEN_INVOICES],
    }),
    getCustomerInvoices: builder.query<
      Paginated<InvoiceListItem>,
      { id: number | string; params?: { page?: number; page_size?: number; status?: string } }
    >({
      query: ({ id, params }) => ({
        url: `/customers/${id}/invoices/`,
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.INVOICE],
    }),
    getCustomerStatement: builder.query<
      CustomerStatement,
      { id: number | string; params?: CustomerStatementParams }
    >({
      query: ({ id, params }) => ({
        url: `/customers/${id}/statement/`,
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.CUSTOMER_STATEMENT],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerOpenInvoicesQuery,
  useGetCustomerInvoicesQuery,
  useGetCustomerStatementQuery,
} = customersApi;
