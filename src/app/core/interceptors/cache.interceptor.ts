import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 100;
  private defaultTtl = 60000;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cacheKey = req.urlWithParams;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached.response);
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.putInCache(cacheKey, event);
        }
      }),
      shareReplay(1),
    );
  }

  private getFromCache(key: string): CacheEntry | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.defaultTtl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  private putInCache(key: string, response: HttpResponse<any>): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  invalidate(url?: string): void {
    if (!url) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(url)) {
        this.cache.delete(key);
      }
    }
  }
}
