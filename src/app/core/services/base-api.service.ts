import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, timer } from 'rxjs';
import { catchError, retry, map, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  ListResponse,
  DetailResponse,
  PaginationParams,
  buildQueryParams,
} from '../../shared/models';

export interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheTtl?: number;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;

  private cacheMap = new Map<string, { data: any; timestamp: number; ttl: number }>();

  get<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const { params, headers, cache = false, cacheTtl = 60000 } = options;

    if (cache) {
      const cacheKey = this.getCacheKey(endpoint, params);
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return of(cached);
      }
    }

    let httpParams = this.buildHttpParams(params);

    let request = this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });

    if (options.retry !== false) {
      request = request.pipe(
        retry({ count: options.retryCount || 3, delay: options.retryDelay || 1000 }),
      );
    }

    return request.pipe(
      catchError(this.handleError),
      tap((data: any) => {
        if (cache) {
          this.setCache(this.getCacheKey(endpoint, params), data, cacheTtl);
        }
      }),
      shareReplay(1),
    );
  }

  post<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    const request = this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
    return request.pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    const request = this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
    return request.pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    const request = this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
    return request.pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const request = this.http.delete<T>(`${this.baseUrl}${endpoint}`);
    return request.pipe(catchError(this.handleError));
  }

  list<T>(
    endpoint: string,
    pagination: PaginationParams,
    options: RequestOptions = {},
  ): Observable<ListResponse<T>> {
    return this.get<ListResponse<T>>(endpoint, {
      ...options,
      params: { ...pagination },
    });
  }

  getById<T>(
    endpoint: string,
    id: number | string,
    options: RequestOptions = {},
  ): Observable<DetailResponse<T>> {
    return this.get<DetailResponse<T>>(`${endpoint}/${id}`, options);
  }

  create<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {},
  ): Observable<DetailResponse<T>> {
    return this.post<DetailResponse<T>>(endpoint, data, options);
  }

  update<T>(
    endpoint: string,
    id: number | string,
    data: any,
    options: RequestOptions = {},
  ): Observable<DetailResponse<T>> {
    return this.patch<DetailResponse<T>>(`${endpoint}/${id}`, data, options);
  }

  remove<T>(
    endpoint: string,
    id: number | string,
    options: RequestOptions = {},
  ): Observable<ApiResponse<T>> {
    return this.delete<ApiResponse<T>>(`${endpoint}/${id}`, options);
  }

  private buildHttpParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              httpParams = httpParams.append(key, String(v));
            });
          } else if (typeof value === 'object') {
            httpParams = httpParams.set(key, JSON.stringify(value));
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }

    return httpParams;
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}?${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cacheMap.get(key);
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > cached.ttl;
      if (!isExpired) {
        return cached.data as T;
      }
      this.cacheMap.delete(key);
    }
    return null;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cacheMap.get(key);
    if (cached && Date.now() - cached.timestamp <= cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cacheMap.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clearCache(): void {
    this.cacheMap.clear();
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cacheMap.clear();
      return;
    }

    for (const key of this.cacheMap.keys()) {
      if (key.includes(pattern)) {
        this.cacheMap.delete(key);
      }
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request';
          break;
        case 401:
          errorMessage = 'Session expired. Please login again.';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
