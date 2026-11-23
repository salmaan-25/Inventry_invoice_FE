import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { handleBlobResponse } from '../../utils/download';
import { buildQueryParams } from '../../utils/query';
import type { Paginated } from '../../types/api/common';
import type {
  Challan,
  ChallanListItem,
  CreateChallanRequest,
  ChallanListParams,
} from '../../types/api/challan';

export const challansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChallans: builder.query<Paginated<ChallanListItem>, ChallanListParams | void>({
      query: (params) => ({
        url: '/challans/',
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.CHALLAN],
    }),
    getChallan: builder.query<Challan, number | string>({
      query: (id) => `/challans/${id}/`,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.CHALLAN, id }],
    }),
    createChallan: builder.mutation<Challan, CreateChallanRequest>({
      query: (body) => ({
        url: '/challans/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        API_TAGS.CHALLAN,
        API_TAGS.AWAITING_DISPATCH,
        API_TAGS.INVOICE,
        API_TAGS.DASHBOARD,
      ],
    }),
    getChallanDocumentBlob: builder.query<Blob, number | string>({
      query: (id) => ({
        url: `/challans/${id}/document/`,
        responseHandler: handleBlobResponse,
      }),
    }),
  }),
});

export const {
  useGetChallansQuery,
  useGetChallanQuery,
  useCreateChallanMutation,
  useLazyGetChallanDocumentBlobQuery,
} = challansApi;
