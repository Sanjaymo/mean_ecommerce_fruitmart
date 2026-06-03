import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  email = signal('');
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error.set('');
    this.success.set('');

    const email = this.email().trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    this.loading.set(true);
    this.auth.requestPasswordResetOtp(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('OTP sent to your email');
        this.router.navigate(['/verify-otp'], { queryParams: { email } });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.error?.errors?.[0]?.msg || 'Could not send OTP');
      },
    });
  }
}
