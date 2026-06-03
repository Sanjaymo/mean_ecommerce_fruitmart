import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  tab = signal<'info' | 'password'>('info');
  user = signal<User | null>(null);
  editMode = signal(false);
  editData = signal({ name: '', email: '', phone: '', profilePhoto: '' });
  msg = signal('');
  err = signal('');

  // Password
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  pwMsg = signal('');
  pwErr = signal('');

  get hasPassword() {
    return Boolean(this.user()?.hasPassword);
  }

  get displayPhone() {
    const phone = String(this.user()?.phone || '').trim();
    if (phone.startsWith('google-')) return 'Google account (phone not set)';
    if (!phone) return 'Not added';
    return phone;
  }

  get displayLocation() {
    const location = this.user()?.deliveryLocation;
    if (!location) return 'Not configured';

    const formatted = String(location.formattedAddress || '').trim();
    if (formatted) return formatted;

    const parts = [location.addressLine, location.city, location.state, location.country]
      .map(v => String(v || '').trim())
      .filter(Boolean);
    return parts.length ? parts.join(', ') : 'Not configured';
  }

  get displayPhoto() {
    const profilePhoto = String(this.user()?.profilePhoto || '').trim();
    if (profilePhoto) return profilePhoto;
    return '';
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadProfile();
  }

  loadProfile() {
    this.api.getProfile().subscribe({
      next: u => {
        this.user.set(u);
        this.editData.set({
          name: u.name,
          email: u.email,
          phone: this.getEditablePhone(u.phone),
          profilePhoto: String(u.profilePhoto || '').trim(),
        });
      },
      error: err => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.err.set('Failed to load profile');
      },
    });
  }

  startEdit() {
    const u = this.user();
    if (!u) return;
    this.editData.set({
      name: u.name,
      email: u.email,
      phone: this.getEditablePhone(u.phone),
      profilePhoto: String(u.profilePhoto || '').trim(),
    });
    this.editMode.set(true);
    this.msg.set('');
    this.err.set('');
  }

  saveProfile() {
    const payload: { name: string; email: string; profilePhoto?: string; phone?: string } = {
      name: String(this.editData().name || '').trim(),
      email: String(this.editData().email || '').trim(),
      profilePhoto: String(this.editData().profilePhoto || '').trim(),
    };

    const normalizedPhone = String(this.editData().phone || '').trim();
    if (normalizedPhone) {
      payload.phone = normalizedPhone;
    }

    this.api.updateProfile(payload).subscribe({
      next: u => {
        this.user.set(u);
        this.auth.updateUser(u);
        this.editMode.set(false);
        this.msg.set('Profile updated successfully');
      },
      error: err => this.err.set(err.error?.message || 'Failed to update profile'),
    });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.err.set('Please select an image file');
      return;
    }
    if (file.size > 1024 * 1024) {
      this.err.set('Profile photo must be 1MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      this.editData.set({ ...this.editData(), profilePhoto: result });
    };
    reader.readAsDataURL(file);
  }

  private getEditablePhone(phone: string) {
    const normalized = String(phone || '').trim();
    return normalized.startsWith('google-') ? '' : normalized;
  }

  changePassword() {
    this.pwMsg.set('');
    this.pwErr.set('');
    if (!this.hasPassword) {
      this.api.setPassword({
        newPassword: this.newPassword(),
        confirmPassword: this.confirmPassword(),
      }).subscribe({
        next: () => {
          this.pwMsg.set('Password set successfully');
          this.newPassword.set('');
          this.confirmPassword.set('');
          const current = this.user();
          if (!current) return;
          const updated: User = { ...current, hasPassword: true };
          this.user.set(updated);
          this.auth.updateUser(updated);
        },
        error: err => this.pwErr.set(err.error?.message || 'Failed to set password'),
      });
      return;
    }

    this.api.changePassword({
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword(),
    }).subscribe({
      next: () => {
        this.pwMsg.set('Password changed successfully');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: err => this.pwErr.set(err.error?.message || 'Failed to change password'),
    });
  }
}
