import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private userRoleSignal = signal<string | null>(null);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly userRole = computed(() => this.userRoleSignal());
  readonly token = computed(() => this.tokenSignal());

  private readonly TOKEN_KEY = 'hrm_token';
  private readonly USER_KEY = 'hrm_user';
  private readonly TOKEN_EXPIRY_KEY = 'hrm_token_expiry';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    if (token && user) {
      this.tokenSignal.set(token);
      this.currentUserSignal.set(JSON.parse(user));
      this.isAuthenticatedSignal.set(true);
      this.userRoleSignal.set(JSON.parse(user).role?.name || 'user');
    } else {
      this.isAuthenticatedSignal.set(false);
    }
  }

  login(token: string, user: User): void {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toISOString());

    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    this.userRoleSignal.set(user.role?.name || 'user');
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.userRoleSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal() || localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(roles: string[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.role?.permissions?.includes(permission) || false;
  }

  updateUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  }
}
