import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  CanMatch,
  ActivatedRouteSnapshot,
  Route,
  Router,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { RbacService } from '../services/rbac.service';
import { PermissionAction, RouteRoleConfig } from '../models/rbac.models';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate, CanMatch {
  private readonly rbacService = inject(RbacService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const config = route.data['rbac'] as RouteRoleConfig | undefined;
    return this.canAccess(config);
  }

  canMatch(route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    const config = route.data?.['rbac'] as RouteRoleConfig | undefined;
    return this.canAccess(config);
  }

  private canAccess(config?: RouteRoleConfig): boolean | UrlTree {

    if (!config) {
      return true;
    }

    if (config.permissions?.length) {
      const hasPermission = this.rbacService.hasAnyPermission(config.permissions);
      if (!hasPermission) {
        return this.handleAccessDenied();
      }
    }

    if (config.roles?.length) {
      const hasRole = this.rbacService.hasAnyRole(config.roles);
      if (!hasRole) {
        return this.handleAccessDenied();
      }
    }

    return true;
  }

  private handleAccessDenied(): UrlTree {
    return this.router.createUrlTree(['/dashboard']);
  }
}
