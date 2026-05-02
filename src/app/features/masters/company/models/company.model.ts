export interface Company {
  id: number;
  name: string;
  code: string;
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logo?: string;
  establishedDate?: string;
  fiscalYearStart?: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  employeeCount?: number;
}

export interface CompanyFilters {
  search?: string;
  status?: 'active' | 'inactive';
  state?: string;
  country?: string;
}
