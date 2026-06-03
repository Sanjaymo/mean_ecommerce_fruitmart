import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  confirmPassword = signal('');
  agreeTerms = signal(true);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordsMatch = signal(true);
  error = signal('');
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  private isStrongPassword(password: string) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  }

  onConfirmPasswordChange() {
    const pwd = this.password();
    const confirm = this.confirmPassword();
    this.passwordsMatch.set(pwd === confirm);
  }

  onSubmit() {
    const fullName = `${this.firstName().trim()} ${this.lastName().trim()}`.trim();

    if (!fullName) {
      this.error.set('Please enter your name');
      return;
    }

    if (!this.isValidEmail(this.email())) {
      this.error.set('Please enter a valid email address');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }
    if (!this.isStrongPassword(this.password())) {
      this.error.set('Password must be 8+ characters and include at least one letter and one number');
      return;
    }

    if (!this.agreeTerms()) {
      this.error.set('Please agree to the terms and conditions');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.auth.register({
      name: fullName,
      email: this.email(),
      phone: this.phone(),
      password: this.password(),
      confirmPassword: this.confirmPassword(),
    }).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: err => {
        this.error.set(err.error?.message || err.error?.errors?.[0]?.msg || 'Registration failed');
        this.loading.set(false);
      },
    });
  }
}
