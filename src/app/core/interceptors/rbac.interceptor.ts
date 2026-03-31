import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RbacService } from '../services/rbac.service';
import { Permission } from '../models/rbac.models';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class RbacInterceptor implements HttpInterceptor {
  private readonly rbacService = inject(RbacService);

  private readonly readOnlyEndpoints = ['GET'];
  private readonly noFilterPaths = ['/auth/', '/login', '/profile'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.shouldFilter(req.url, req.method)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.filterResponse(req, event);
        }
      }),
    );
  }

  private shouldFilter(url: string, method: string): boolean {
    if (this.noFilterPaths.some((path) => url.includes(path))) {
      return false;
    }

    if (!this.readOnlyEndpoints.includes(method)) {
      return false;
    }

    return true;
  }

  private filterResponse(req: HttpRequest<any>, response: HttpResponse<any>): HttpResponse<any> {
    const body = response.body;

    if (!body) {
      return response;
    }

    if (Array.isArray(body)) {
      const filtered = this.rbacService.filterResourcesByPermission(
        body,
        this.extractResourceKey(req.url),
        Permission.READ,
      );
      return response.clone({ body: filtered });
    }

    if (body.data && Array.isArray(body.data)) {
      const filtered = this.rbacService.filterResourcesByPermission(
        body.data,
        this.extractResourceKey(req.url),
        Permission.READ,
      );
      return response.clone({ body: { ...body, data: filtered } });
    }

    return response;
  }

  private extractResourceKey(url: string): string {
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'list' || lastSegment === 'all') {
      return segments[segments.length - 2] || 'unknown';
    }

    return lastSegment.replace(/-/g, '_').replace(/s$/, '');
  }
}
