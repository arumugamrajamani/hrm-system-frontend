import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: any;
}

export interface TwoFactorSetup {
  secret: string;
  qrDataUrl: string;
  backupCodes: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(
    username: string,
    email: string,
    mobile: string,
    password: string,
    roleId: number,
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, {
      username,
      email,
      mobile,
      password,
      role_id: roleId,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, {
      email,
      password,
    });
  }

  verify2FA(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/verify-2fa`, {
      email,
      otp,
    });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/verify-otp`, {
      email,
      otp,
    });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/refresh`, {
      refreshToken,
    });
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, {});
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, {
      email,
    });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, {
      email,
      otp,
      new_password: newPassword,
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  setup2FA(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/setup-2fa`, {});
  }

  verify2FASetup(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/verify-2fa-setup`, {
      email,
      otp,
    });
  }

  disable2FA(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/disable-2fa`, {});
  }
}
