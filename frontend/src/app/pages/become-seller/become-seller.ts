import { Component, OnInit, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-become-seller',
  imports: [FormsModule, RouterLink],
  templateUrl: './become-seller.html',
})
export class BecomeSeller implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  step = signal(1);
  totalSteps = 3;

  // Step 1 — Identity
  userPhoto = signal('');
  introNote = signal('');

  // Step 2 — Shop
  shopName = signal('');
  shopLocation = signal('');
  shopPhoto = signal('');
  contributionPercent = signal(10);

  submitting = signal(false);
  submitted = signal(false);
  err = signal('');

  userName = computed(() => this.auth.user()?.name ?? '');
  userRole = computed(() => this.auth.user()?.role);
  sellerStatus = computed(() => this.auth.user()?.sellerProfile?.sellerStatus);
  isAlreadySeller = computed(() => this.auth.user()?.role === 'seller');
  isApprovedSeller = computed(
    () => this.auth.user()?.role === 'seller' || this.auth.user()?.sellerProfile?.sellerStatus === 'approved'
  );
  hasPendingApplication = computed(() => this.auth.user()?.sellerProfile?.sellerStatus === 'pending');
  wasRejected = computed(() => this.auth.user()?.sellerProfile?.sellerStatus === 'rejected');

  readonly progressPct = computed(() => Math.round(((this.step() - 1) / (this.totalSteps - 1)) * 100));

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (this.isApprovedSeller()) {
        queueMicrotask(() => this.router.navigate(['/seller-dashboard']));
      }
    });
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Strict redirect: approved sellers should never stay on become-seller.
    if (this.isApprovedSeller()) {
      this.router.navigate(['/seller-dashboard']);
      return;
    }

    this.auth.refreshProfile().subscribe((user) => {
      if (user?.role === 'seller' || user?.sellerProfile?.sellerStatus === 'approved' || this.isApprovedSeller()) {
        this.router.navigate(['/seller-dashboard']);
      }
    });
  }

  onUserPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { this.err.set('Your photo must be under 500 KB'); return; }
    this.err.set('');
    const reader = new FileReader();
    reader.onload = () => this.userPhoto.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onShopPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { this.err.set('Shop photo must be under 500 KB'); return; }
    this.err.set('');
    const reader = new FileReader();
    reader.onload = () => this.shopPhoto.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  nextStep() {
    this.err.set('');
    if (this.step() === 2) {
      if (!this.shopName().trim()) { this.err.set('Shop name is required'); return; }
      if (!this.shopLocation().trim()) { this.err.set('Shop location / city is required'); return; }
      if (this.contributionPercent() < 1 || this.contributionPercent() > 50) {
        this.err.set('Platform contribution must be between 1% and 50%'); return;
      }
    }
    this.step.update(s => Math.min(s + 1, this.totalSteps));
  }

  prevStep() {
    this.err.set('');
    this.step.update(s => Math.max(s - 1, 1));
  }

  submit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.err.set('');
    this.submitting.set(true);

    this.api.applyForSeller({
      shopName: this.shopName(),
      shopLocation: this.shopLocation(),
      shopPhoto: this.shopPhoto(),
      userPhoto: this.userPhoto(),
      contributionPercent: this.contributionPercent(),
    }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res?.user) {
          this.auth.updateUser(res.user);
        } else {
          this.auth.refreshProfile().subscribe();
        }
        this.submitted.set(true);
      },
      error: (e: any) => {
        this.submitting.set(false);
        const firstError = e?.error?.errors?.[0]?.msg;
        const backendMessage = String(firstError || e?.error?.message || '').toLowerCase();
        if (backendMessage.includes('already under review') || backendMessage.includes('under review')) {
          this.auth.refreshProfile().subscribe();
          this.err.set('You already submitted your application. Please wait for admin approval or rejection.');
          return;
        }
        this.err.set(firstError || e?.error?.message || 'Failed to submit application. Please try again.');
      },
    });
  }
}
