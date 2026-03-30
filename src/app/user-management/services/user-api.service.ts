import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User, PaginationParams, PaginatedResponse } from '../../core/models';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly apiUrl = environment.usersApiUrl;

  constructor(private http: HttpClient) {}

  getUsers(params: PaginationParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
      httpParams = httpParams.set('sortOrder', params.sortOrder || 'asc');
    }

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params: httpParams });
  }

  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User> | FormData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user);
  }

  updateUserWithFile(id: number, formData: FormData): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  checkEmailUnique(email: string, excludeId?: number): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('email', email);
    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check-email`, { params });
  }

  checkMobileUnique(mobile: string, excludeId?: number): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('mobile', mobile);
    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check-mobile`, { params });
  }
}
