import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Company, CompanyFilters } from '../models/company.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../../shared/models/api-response.model';

interface ApiCompany {
  id: number;
  name: string;
  code: string;
  legal_name?: string;
  registration_number?: string;
  tax_id?: string;
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
  established_date?: string;
  fiscal_year_start?: string;
  is_active: boolean;
  status: 'active' | 'inactive';
  employee_count?: number;
}

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/companies`;

  private mapApiToCompany(api: ApiCompany): Company {
    return {
      id: api.id,
      name: api.name,
      code: api.code,
      legalName: api.legal_name,
      registrationNumber: api.registration_number,
      taxId: api.tax_id,
      gstin: api.gstin,
      pan: api.pan,
      cin: api.cin,
      industry: api.industry,
      website: api.website,
      email: api.email,
      phone: api.phone,
      fax: api.fax,
      address: api.address,
      city: api.city,
      state: api.state,
      country: api.country,
      pincode: api.pincode,
      logo: api.logo,
      establishedDate: api.established_date,
      fiscalYearStart: api.fiscal_year_start,
      isActive: api.is_active,
      status: api.status,
      employeeCount: api.employee_count,
    };
  }

  list(params?: Record<string, unknown>): Observable<ListResponse<Company>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<ApiCompany>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item) => this.mapApiToCompany(item)),
      })),
    );
  }

  getById(id: number): Observable<DetailResponse<Company>> {
    return this.http.get<DetailResponse<ApiCompany>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToCompany(response.data),
      })),
    );
  }

  getActiveCompanies(): Observable<ListResponse<Company>> {
    return this.http.get<ListResponse<ApiCompany>>(`${this.baseUrl}/active`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item) => this.mapApiToCompany(item)),
      })),
    );
  }

  create(data: any): Observable<DetailResponse<Company>> {
    const payload = {
      name: data.name,
      code: data.code,
      legal_name: data.legal_name,
      registration_number: data.registration_number,
      tax_id: data.tax_id,
      gstin: data.gstin,
      pan: data.pan,
      cin: data.cin,
      industry: data.industry,
      website: data.website,
      email: data.email,
      phone: data.phone,
      fax: data.fax,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      logo: data.logo,
      established_date: data.established_date,
      fiscal_year_start: data.fiscal_year_start,
      is_active: data.status === 'active',
    };
    return this.http.post<DetailResponse<ApiCompany>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToCompany(response.data),
      })),
    );
  }

  update(id: number, data: any): Observable<DetailResponse<Company>> {
    const payload = {
      name: data.name,
      code: data.code,
      legal_name: data.legal_name,
      registration_number: data.registration_number,
      tax_id: data.tax_id,
      gstin: data.gstin,
      pan: data.pan,
      cin: data.cin,
      industry: data.industry,
      website: data.website,
      email: data.email,
      phone: data.phone,
      fax: data.fax,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      logo: data.logo,
      established_date: data.established_date,
      fiscal_year_start: data.fiscal_year_start,
      is_active: data.status === 'active',
    };
    return this.http.put<DetailResponse<ApiCompany>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToCompany(response.data),
      })),
    );
  }

  delete(id: number): Observable<ApiResponse<Company>> {
    return this.http.delete<ApiResponse<ApiCompany>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToCompany(response.data) : undefined,
      })),
    );
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Company>> {
    return this.http
      .patch<
        ApiResponse<ApiCompany>
      >(`${this.baseUrl}/${id}/${status === 'active' ? 'activate' : 'deactivate'}`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToCompany(response.data) : undefined,
        })),
      );
  }
}
