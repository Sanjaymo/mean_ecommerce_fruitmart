import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  private isStrongPassword(password: string) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  }

  onSubmit() {
    this.error.set('');

    const email = sessionStorage.getItem('fm_reset_email') || '';
    const resetToken = sessionStorage.getItem('fm_reset_token') || '';
    if (!email || !resetToken) {
      this.error.set('Reset session expired. Please restart from forgot password.');
      return;
    }

    if (!this.isStrongPassword(this.password())) {
      this.error.set('Password must be 8+ characters and include at least one letter and one number');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.auth.resetPassword(email, resetToken, this.password(), this.confirmPassword()).subscribe({
      next: () => {
        this.loading.set(false);
        sessionStorage.removeItem('fm_reset_email');
        sessionStorage.removeItem('fm_reset_token');
        this.router.navigate(['/login'], { queryParams: { reset: '1' } });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.error?.errors?.[0]?.msg || 'Password reset failed');
      },
    });
  }
}
