import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify-otp',
  imports: [FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './verify-otp.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyOtpPage {
  email = signal('');
  otp = signal('');
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    const qEmail = this.route.snapshot.queryParamMap.get('email') || '';
    if (qEmail) this.email.set(qEmail);
  }

  onSubmit() {
    this.error.set('');

    const email = this.email().trim().toLowerCase();
    const otp = this.otp().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('Please enter a valid email address');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      this.error.set('OTP must be 6 digits');
      return;
    }

    this.loading.set(true);
    this.auth.verifyPasswordResetOtp(email, otp).subscribe({
      next: (res) => {
        this.loading.set(false);
        sessionStorage.setItem('fm_reset_email', email);
        sessionStorage.setItem('fm_reset_token', res.resetToken);
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.error?.errors?.[0]?.msg || 'OTP verification failed');
      },
    });
  }
}
