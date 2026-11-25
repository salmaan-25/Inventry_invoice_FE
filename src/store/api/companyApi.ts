import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { setCachedCompanyBranding } from '../../utils/branding';
import type {
  CompanyProfile,
  CompanyProfileDto,
  UpdateCompanyRequest,
} from '../../types/api/company';

const syncCompanyBranding = (dto: CompanyProfileDto): CompanyProfile => {
  const profile: CompanyProfile = {
    ...dto,
    logo: dto.logo ?? undefined,
  };
  if (profile.business_name) {
    setCachedCompanyBranding({
      business_name: profile.business_name,
      logo: profile.logo,
    });
  }
  return profile;
};

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompany: builder.query<CompanyProfile, void>({
      query: () => '/company/',
      transformResponse: syncCompanyBranding,
      providesTags: [API_TAGS.COMPANY],
    }),
    updateCompany: builder.mutation<CompanyProfile, UpdateCompanyRequest>({
      query: (data) => {
        if (data.logo instanceof File) {
          const formData = new FormData();
          formData.append('business_name', data.business_name);
          formData.append('address', data.address);
          formData.append('phone', data.phone);
          formData.append('email', data.email);
          formData.append('gstin', data.gstin);
          formData.append('logo', data.logo);
          return {
            url: '/company/',
            method: 'PATCH',
            body: formData,
          };
        }

        return {
          url: '/company/',
          method: 'PATCH',
          body: {
            business_name: data.business_name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            gstin: data.gstin,
          },
        };
      },
      transformResponse: syncCompanyBranding,
      invalidatesTags: [API_TAGS.COMPANY],
    }),
  }),
});

export const { useGetCompanyQuery, useUpdateCompanyMutation } = companyApi;
