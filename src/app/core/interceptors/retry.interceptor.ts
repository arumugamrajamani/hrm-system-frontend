import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private readonly retryableMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  private readonly maxRetries = 3;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRetryableRequest(req)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      retry({
        count: this.maxRetries,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          if (!this.shouldRetry(error, retryCount)) {
            throw error;
          }
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`Retry ${retryCount} after ${delay}ms - ${error.status} ${error.statusText}`);
          return new Observable((observer) => {
            setTimeout(() => observer.next(retryCount), delay);
          });
        },
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      }),
    );
  }

  private isRetryableRequest(req: HttpRequest<any>): boolean {
    return this.retryableMethods.includes(req.method);
  }

  private shouldRetry(error: HttpErrorResponse, retryCount: number): boolean {
    if (retryCount >= this.maxRetries) return false;

    if (error.status === 0 || error.status === 503) return true;

    if (error.status >= 500) return true;

    return false;
  }
}
