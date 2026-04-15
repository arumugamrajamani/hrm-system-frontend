export interface Location {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  parentName?: string;
  parentCode?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  phone?: string;
  email?: string;
  isHeadquarters: boolean;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  createdByUsername?: string;
  updatedByUsername?: string;
}

export interface LocationTree extends Location {
  children: LocationTree[];
  level?: number;
  path?: string;
}

export interface LocationFilters {
  search?: string;
  parentId?: number;
  status?: 'active' | 'inactive';
  hierarchy?: boolean;
}

export interface CreateLocationDto {
  location_name: string;
  location_code?: string;
  parent_location_id?: number;
  address?: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  is_headquarters?: boolean;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {}

export interface BranchCodeResponse {
  branch_code: string;
}
