import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService, ToasterService } from '../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    console.log('Interceptor - Token:', token ? 'Token exists' : 'No token');
    console.log('Interceptor - URL:', req.url);

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Interceptor - Added Bearer token');
    } else {
      console.log('Interceptor - No token added, request will be unauthenticated');
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = '';
    const toasterService = new ToasterService();

    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Bad Request. Please check your input.';
        break;
      case 401:
        errorMessage = 'Session expired. Please login again.';
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        break;
      case 403:
        errorMessage = 'Access denied. You do not have permission.';
        break;
      case 404:
        errorMessage = error.error?.message || 'Resource not found.';
        break;
      case 422:
        errorMessage = error.error?.message || 'Validation error.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      case 0:
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.error?.message || 'An unexpected error occurred.';
    }

    toasterService.error('Error', errorMessage);
    return throwError(() => error);
  }
}
