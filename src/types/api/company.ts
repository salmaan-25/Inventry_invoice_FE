export interface CompanyProfileDto {
  id: number;
  business_name: string;
  logo: string | null;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: number;
  business_name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  updated_at: string;
}

export interface UpdateCompanyRequest {
  business_name: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  logo?: File;
}
