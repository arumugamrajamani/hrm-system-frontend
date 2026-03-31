import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RbacService } from '../services';
import { Role } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private readonly rbacService = inject(RbacService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Role[] | undefined;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (this.rbacService.hasAnyRole(requiredRoles)) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
