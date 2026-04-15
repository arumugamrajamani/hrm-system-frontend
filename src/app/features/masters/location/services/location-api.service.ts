import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Location,
  LocationTree,
  CreateLocationDto,
  UpdateLocationDto,
  BranchCodeResponse,
} from '../models/location.model';

interface ApiLocation {
  id: number;
  location_name: string;
  location_code: string;
  parent_location_id?: number;
  parent_id?: number;
  address?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  phone?: string;
  email?: string;
  is_headquarters: boolean;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_username?: string;
  updated_by_username?: string;
}

interface ListResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface DetailResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.locationsApiUrl;

  private mapApiToLocation(api: ApiLocation): Location {
    return {
      id: api.id,
      name: api.location_name,
      code: api.location_code,
      parentId: api.parent_location_id || api.parent_id,
      parentName: (api as any).parent_location_name || (api as any).parentName,
      parentCode: (api as any).parent_location_code || (api as any).parentCode,
      address: api.address,
      city: api.city,
      state: api.state,
      country: api.country,
      pincode: api.pincode,
      phone: api.phone,
      email: api.email,
      isHeadquarters: api.is_headquarters,
      description: api.description,
      status: api.status,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
      createdBy: api.created_by,
      updatedBy: api.updated_by,
      createdByUsername: api.created_by_username,
      updatedByUsername: api.updated_by_username,
    };
  }

  list(params?: Record<string, unknown>): Observable<ListResponse<Location>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<ApiLocation>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => ({
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.mapApiToLocation(item))
          : [],
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in list:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  getTree(): Observable<{ data: LocationTree[]; success: boolean }> {
    return this.http
      .get<{ data: ApiLocation[]; success: boolean }>(`${this.baseUrl}/hierarchy`)
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((item) => this.mapApiToLocation(item) as LocationTree),
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('API Error in getTree:', error);
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => error);
        }),
      );
  }

  getChildren(id: number): Observable<{ data: Location[]; success: boolean }> {
    return this.http
      .get<{ data: ApiLocation[]; success: boolean }>(`${this.baseUrl}/${id}/children`)
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((item) => this.mapApiToLocation(item)),
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('API Error in getChildren:', error);
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => error);
        }),
      );
  }

  getById(id: number): Observable<DetailResponse<Location>> {
    return this.http.get<DetailResponse<ApiLocation>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToLocation(response.data),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in getById:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  create(data: CreateLocationDto): Observable<DetailResponse<Location>> {
    const payload: Record<string, unknown> = {
      location_name: data.location_name,
      city: data.city,
      state: data.state,
    };

    if (data.location_code) payload['location_code'] = data.location_code;
    if (data.parent_location_id) payload['parent_location_id'] = data.parent_location_id;
    if (data.address) payload['address'] = data.address;
    if (data.country) payload['country'] = data.country;
    if (data.pincode) payload['pincode'] = data.pincode;
    if (data.phone) payload['phone'] = data.phone;
    if (data.email) payload['email'] = data.email;
    if (data.is_headquarters) payload['is_headquarters'] = data.is_headquarters;
    if (data.description) payload['description'] = data.description;
    if (data.status) payload['status'] = data.status;

    return this.http.post<DetailResponse<ApiLocation>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToLocation(response.data),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in create:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  update(id: number, data: UpdateLocationDto): Observable<DetailResponse<Location>> {
    const payload: Record<string, unknown> = {};

    if (data.location_name !== undefined) payload['location_name'] = data.location_name;
    if (data.location_code !== undefined) payload['location_code'] = data.location_code;
    if (data.parent_location_id !== undefined)
      payload['parent_location_id'] = data.parent_location_id;
    if (data.address !== undefined) payload['address'] = data.address;
    if (data.city !== undefined) payload['city'] = data.city;
    if (data.state !== undefined) payload['state'] = data.state;
    if (data.country !== undefined) payload['country'] = data.country;
    if (data.pincode !== undefined) payload['pincode'] = data.pincode;
    if (data.phone !== undefined) payload['phone'] = data.phone;
    if (data.email !== undefined) payload['email'] = data.email;
    if (data.is_headquarters !== undefined) payload['is_headquarters'] = data.is_headquarters;
    if (data.description !== undefined) payload['description'] = data.description;
    if (data.status !== undefined) payload['status'] = data.status;

    return this.http.put<DetailResponse<ApiLocation>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToLocation(response.data),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in update:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  delete(id: number): Observable<ApiResponse<Location>> {
    return this.http.delete<ApiResponse<ApiLocation>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToLocation(response.data) : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in delete:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  activate(id: number): Observable<ApiResponse<Location>> {
    return this.http.patch<ApiResponse<ApiLocation>>(`${this.baseUrl}/${id}/activate`, {}).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToLocation(response.data) : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in activate:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  deactivate(id: number): Observable<ApiResponse<Location>> {
    return this.http.patch<ApiResponse<ApiLocation>>(`${this.baseUrl}/${id}/deactivate`, {}).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToLocation(response.data) : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in deactivate:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  setHeadquarters(id: number): Observable<ApiResponse<Location>> {
    return this.http.patch<ApiResponse<ApiLocation>>(`${this.baseUrl}/${id}/headquarters`, {}).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToLocation(response.data) : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in setHeadquarters:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  generateCode(prefix?: string): Observable<{ data: BranchCodeResponse; success: boolean }> {
    let params = new HttpParams();
    if (prefix) {
      params = params.set('prefix', prefix);
    }
    return this.http
      .get<{
        data: BranchCodeResponse;
        success: boolean;
      }>(`${this.baseUrl}/generate-code/code`, { params })
      .pipe(
        map((response) => ({
          ...response,
          data: { branch_code: response.data.branch_code },
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('API Error in generateCode:', error);
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => error);
        }),
      );
  }
}
