import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            error_callback?: () => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private googleClientId = '';
  private googleInitAttempts = 0;
  private googleInitTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly signInRedirectDelayMs = 180;

  isAdmin = signal(false);
  identifier = signal('');
  password = signal('');
  showPassword = signal(false);
  error = signal('');
  success = signal('');
  loading = signal(false);
  googleEnabled = signal(false);

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.success.set('Registration successful, please login');
    }
    if (this.route.snapshot.queryParamMap.get('reset') === '1') {
      this.success.set('Password reset successful. Please login with your new password.');
    }
  }

  toggleMode() {
    this.isAdmin.update(v => !v);
    this.error.set('');
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getGoogleClientId().subscribe({
      next: ({ clientId }) => {
        this.googleClientId = String(clientId || '').trim();
        this.googleInitAttempts = 0;
        this.tryInitializeGoogleAuth();
      },
      error: () => {
        // fallback to a global injected client id for local development
        const fallback = (window as any).__FM_GOOGLE_CLIENT_ID;
        if (fallback) {
          this.googleClientId = String(fallback || '').trim();
          this.googleInitAttempts = 0;
          this.tryInitializeGoogleAuth();
        } else {
          this.googleEnabled.set(false);
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.googleInitTimer) {
      clearTimeout(this.googleInitTimer);
      this.googleInitTimer = null;
    }
  }

  private tryInitializeGoogleAuth() {
    const configuredClientId = this.googleClientId;
    if (!configuredClientId || !window.google?.accounts?.id) {
      if (this.googleInitAttempts < 20) {
        this.googleInitAttempts += 1;
        this.googleInitTimer = setTimeout(() => this.tryInitializeGoogleAuth(), 250);
      }
      this.googleEnabled.set(false);
      return;
    }

    const target = document.getElementById('google-signin-target');
    if (!target) return;

    window.google.accounts.id.initialize({
      client_id: configuredClientId,
      callback: ({ credential }) => this.handleGoogleCredential(credential),
      error_callback: () => {
        this.error.set('Google sign-in is currently unavailable. Please try again.');
      },
    });

    target.innerHTML = '';
    window.google.accounts.id.renderButton(target, {
      theme: 'outline',
      size: 'large',
      width: 320,
      shape: 'rectangular',
      text: 'signin_with',
      logo_alignment: 'left',
    });
    this.googleEnabled.set(true);
  }

  handleGoogleCredential(credential: string) {
    if (!credential) {
      this.error.set('Google sign-in did not return a credential. Please try again.');
      this.loading.set(false);
      return;
    }

    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    this.auth.googleLogin(credential).subscribe({
      next: res => {
        this.auth.handleAuth(res);
        this.deferSignInRedirect('/dashboard');
      },
      error: err => {
        this.error.set(err.error?.message || 'Google sign-in failed');
        this.loading.set(false);
      },
    });
  }

  onSubmit() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    if (this.isAdmin()) {
      this.auth.adminLogin(this.identifier(), this.password()).subscribe({
        next: res => {
          this.auth.handleAuth(res);
          this.deferSignInRedirect(res.user.role === 'admin' ? '/admin' : '/dashboard');
        },
        error: err => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);
        },
      });
    } else {
      this.auth.login(this.identifier(), this.password()).subscribe({
        next: res => {
          this.auth.handleAuth(res);
          this.deferSignInRedirect(res.user.role === 'admin' ? '/admin' : '/dashboard');
        },
        error: err => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);
        },
      });
    }
  }

  private deferSignInRedirect(destination: string) {
    setTimeout(() => {
      void this.router.navigate([destination]);
    }, this.signInRedirectDelayMs);
  }
}
