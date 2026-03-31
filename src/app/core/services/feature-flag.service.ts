import { Injectable, signal, computed, inject } from '@angular/core';
import { RbacService } from './rbac.service';
import { FeatureFlag, Role, PermissionAction } from '../models/rbac.models';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  private readonly rbacService = inject(RbacService);

  private featureFlags = signal<FeatureFlag[]>([]);

  readonly flags = computed(() => this.featureFlags());

  readonly enabledFlags = computed(() => {
    const allFlags = this.featureFlags();
    return allFlags.filter((flag) => this.isFlagEnabled(flag));
  });

  registerFlags(flags: FeatureFlag[]): void {
    this.featureFlags.set(flags);
  }

  registerFlag(flag: FeatureFlag): void {
    this.featureFlags.update((flags) => [...flags, flag]);
  }

  unregisterFlag(key: string): void {
    this.featureFlags.update((flags) => flags.filter((f) => f.key !== key));
  }

  updateFlag(key: string, enabled: boolean): void {
    this.featureFlags.update((flags) => flags.map((f) => (f.key === key ? { ...f, enabled } : f)));
  }

  isFeatureEnabled(featureKey: string): boolean {
    const flag = this.featureFlags().find((f) => f.key === featureKey);
    if (!flag) return false;
    return this.isFlagEnabled(flag);
  }

  private isFlagEnabled(flag: FeatureFlag): boolean {
    if (!flag.enabled) return false;

    if (flag.roles?.length) {
      if (!this.rbacService.hasAnyRole(flag.roles)) {
        return false;
      }
    }

    if (flag.permissions?.length) {
      if (!this.rbacService.hasAnyPermission(flag.permissions)) {
        return false;
      }
    }

    return true;
  }

  canAccessModule(moduleKey: string, roles?: Role[], permissions?: PermissionAction[]): boolean {
    if (roles?.length) {
      return this.rbacService.hasAnyRole(roles);
    }

    if (permissions?.length) {
      return this.rbacService.hasAnyPermission(permissions);
    }

    return true;
  }
}
