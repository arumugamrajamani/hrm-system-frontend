import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private userRoleSignal = signal<string | null>(null);
  private userPermissionsSignal = signal<string[]>([]);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly userRole = computed(() => this.userRoleSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly permissions = computed(() => this.userPermissionsSignal());

  private readonly TOKEN_KEY = 'hrm_token';
  private readonly USER_KEY = 'hrm_user';
  private readonly TOKEN_EXPIRY_KEY = 'hrm_token_expiry';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      const user = JSON.parse(userJson);
      this.setUserData(token, user);
    } else {
      this.isAuthenticatedSignal.set(false);
    }
  }

  private setUserData(token: string, user: User): void {
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);

    let roleName = 'user';
    let permissions: string[] = [];

    if (typeof user.role === 'string') {
      roleName = user.role;
      if (roleName === 'Super Admin') {
        permissions = ['all'];
      }
    } else if (user.role && typeof user.role === 'object') {
      roleName = user.role.name || user.role_name || 'user';
      permissions = user.role.permissions || user.permissions || [];
    }

    this.userRoleSignal.set(roleName);
    this.userPermissionsSignal.set(permissions);
  }

  login(token: string, user: User): void {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toISOString());

    this.setUserData(token, user);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.userRoleSignal.set(null);
    this.userPermissionsSignal.set([]);
  }

  getToken(): string | null {
    return this.tokenSignal() || localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(roles: string[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  hasPermission(permission: string): boolean {
    const permissions = this.userPermissionsSignal();

    if (permissions.length === 0) return true;
    if (permissions.includes('all')) return true;

    return permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.userPermissionsSignal();

    if (userPermissions.length === 0) return true;
    if (userPermissions.includes('all')) return true;

    return permissions.some((p) => userPermissions.includes(p));
  }

  updateUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.setUserData(this.tokenSignal() || '', user);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  }
}
