import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User, PaginationParams, PaginatedResponse } from '../../core/models';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
        httpParams = httpParams.set('sortOrder', params.sortOrder || 'asc');
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
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

  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  updateUserWithFile(id: number, formData: FormData): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, formData);
  }

  activateUser(id: number): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  getRoles(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/roles`);
  }

  getUserByEmail(email: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/with-email`, { email });
  }
}
