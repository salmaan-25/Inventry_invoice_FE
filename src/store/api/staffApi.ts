import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import type { Paginated } from '../../types/api/common';
import type {
  StaffMember,
  CreateStaffRequest,
  UpdateStaffRequest,
  SetStaffPasswordRequest,
  StaffListParams,
} from '../../types/api/staff';

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<Paginated<StaffMember>, StaffListParams | void>({
      query: (params) => ({
        url: '/staff/',
        params: buildQueryParams(params ?? {}),
      }),
      providesTags: [API_TAGS.STAFF],
    }),
    createStaff: builder.mutation<StaffMember, CreateStaffRequest>({
      query: (data) => ({
        url: '/staff/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [API_TAGS.STAFF],
    }),
    updateStaff: builder.mutation<StaffMember, UpdateStaffRequest>({
      query: ({ id, ...body }) => ({
        url: `/staff/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.STAFF],
    }),
    deleteStaff: builder.mutation<{ detail: string }, number>({
      query: (id) => ({
        url: `/staff/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.STAFF],
    }),
    setStaffPassword: builder.mutation<{ detail: string }, SetStaffPasswordRequest>({
      query: ({ id, ...body }) => ({
        url: `/staff/${id}/set-password/`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useSetStaffPasswordMutation,
} = staffApi;
