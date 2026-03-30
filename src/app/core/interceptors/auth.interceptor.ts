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
    private toasterService: ToasterService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('hrm_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = '';
    let showToast = true;

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
        showToast = false;
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

    if (showToast && errorMessage) {
      this.toasterService.error('Error', errorMessage);
    }
    return throwError(() => error);
  }
}
