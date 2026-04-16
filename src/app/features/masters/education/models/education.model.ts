export interface Education {
  id?: number;
  education_name: string;
  education_code: string;
  level: 'School' | 'UG' | 'PG' | 'Doctorate' | 'Certification';
  description?: string;
  status: 'active' | 'inactive';
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  created_by_username?: string;
  updated_by_username?: string;
}

export interface EducationPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  status?: string;
}

export interface EducationApiResponse {
  success: boolean;
  message: string;
  data?: Education[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleEducationApiResponse {
  success: boolean;
  message: string;
  data?: Education;
}
