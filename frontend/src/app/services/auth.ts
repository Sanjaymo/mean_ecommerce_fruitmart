import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { User, AuthResponse } from '../models/interfaces';
import { SKIP_GLOBAL_LOADER } from '../interceptors/loading.interceptor';
import { runtimeConfig } from '../config/runtime-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = runtimeConfig.apiBaseUrl;
  private readonly currentUser = signal<User | null>(null);
  private readonly token = signal<string | null>(null);
  private profileRefreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isSeller = computed(() => this.currentUser()?.role === 'seller');

  constructor(private http: HttpClient, private router: Router) {
    const saved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('fm_token') : null;
    const savedUser = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('fm_user') : null;

    if (saved && savedUser && !this.isTokenExpired(saved)) {
      try {
        this.token.set(saved);
        this.currentUser.set(JSON.parse(savedUser) as User);
        this.refreshProfile().subscribe();
        this.startProfileSync();
      } catch {
        this.clearStoredAuth();
      }
    } else if (saved || savedUser) {
      this.clearStoredAuth();
    }
  }

  getToken() {
    return this.token();
  }

  register(data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, data);
  }

  login(identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, { identifier, password });
  }

  googleLogin(credential: string) {
    return this.http.post<AuthResponse>(`${this.API}/auth/google-login`, { credential });
  }

  getGoogleClientId() {
    return this.http.get<{ clientId: string }>(`${this.API}/auth/google-config`);
  }

  adminLogin(identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/auth/admin-login`, { identifier, password });
  }

  requestPasswordResetOtp(email: string) {
    return this.http.post<{ message: string }>(`${this.API}/auth/forgot-password/request-otp`, { email });
  }

  verifyPasswordResetOtp(email: string, otp: string) {
    return this.http.post<{ message: string; resetToken: string }>(`${this.API}/auth/forgot-password/verify-otp`, {
      email,
      otp,
    });
  }

  resetPassword(email: string, resetToken: string, password: string, confirmPassword: string) {
    return this.http.post<{ message: string }>(`${this.API}/auth/forgot-password/reset`, {
      email,
      resetToken,
      password,
      confirmPassword,
    });
  }

  handleAuth(res: AuthResponse) {
    this.token.set(res.token);
    this.currentUser.set(res.user);
    sessionStorage.setItem('fm_token', res.token);
    sessionStorage.setItem('fm_user', JSON.stringify(res.user));
    this.startProfileSync();
  }

  logout() {
    this.stopProfileSync();
    this.token.set(null);
    this.currentUser.set(null);
    this.clearStoredAuth();
    this.router.navigate(['/']);
  }

  updateUser(user: User) {
    this.currentUser.set(user);
    sessionStorage.setItem('fm_user', JSON.stringify(user));
  }

  refreshProfile() {
    if (!this.token()) {
      return of(null);
    }

    return this.http.get<User>(`${this.API}/user/profile`, {
      context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
    }).pipe(
      tap((user) => this.updateUser(user)),
      catchError(() => of(null))
    );
  }

  private startProfileSync() {
    if (typeof window === 'undefined' || !this.token()) return;

    this.stopProfileSync();
    this.profileRefreshTimer = setInterval(() => {
      this.refreshProfile().subscribe();
    }, 30000);

    window.addEventListener('focus', this.handleWindowFocus);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private stopProfileSync() {
    if (this.profileRefreshTimer) {
      clearInterval(this.profileRefreshTimer);
      this.profileRefreshTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleWindowFocus);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleWindowFocus = () => {
    this.refreshProfile().subscribe();
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.refreshProfile().subscribe();
    }
  };

  private clearStoredAuth() {
    sessionStorage.removeItem('fm_token');
    sessionStorage.removeItem('fm_user');
  }

  private isTokenExpired(token: string) {
    try {
      const [, payload] = token.split('.');
      if (!payload) return true;

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized)) as { exp?: number };

      return !decoded.exp || decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
