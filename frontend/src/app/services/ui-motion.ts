import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiMotionService {
  private readonly requestCount = signal(0);
  private readonly navigating = signal(false);
  private readonly stage = signal('');
  private stageClearTimer: ReturnType<typeof setTimeout> | null = null;

  readonly activeRequests = this.requestCount.asReadonly();
  readonly isNavigating = this.navigating.asReadonly();
  readonly stageLabel = this.stage.asReadonly();
  readonly isBusy = computed(() => this.requestCount() > 0 || this.navigating());

  startNavigation(url: string) {
    this.navigating.set(true);
    this.setStage(this.navigationLabel(url));
  }

  endNavigation() {
    this.navigating.set(false);
    this.scheduleStageCleanup();
  }

  startRequest(url: string, method: string) {
    this.requestCount.update((count) => count + 1);
    this.setStage(this.requestLabel(url, method));
  }

  endRequest() {
    this.requestCount.update((count) => Math.max(0, count - 1));
    this.scheduleStageCleanup();
  }

  private setStage(value: string) {
    if (this.stageClearTimer) {
      clearTimeout(this.stageClearTimer);
      this.stageClearTimer = null;
    }
    this.stage.set(value);
  }

  private scheduleStageCleanup() {
    if (this.requestCount() > 0 || this.navigating()) {
      return;
    }

    this.stageClearTimer = setTimeout(() => {
      this.stage.set('');
      this.stageClearTimer = null;
    }, 220);
  }

  private navigationLabel(url: string) {
    if (url.includes('/payment')) return 'Preparing payment experience';
    if (url.includes('/order')) return 'Opening order journey';
    if (url.includes('/login') || url.includes('/register')) return 'Opening secure access';
    if (url.includes('/profile')) return 'Loading profile center';
    if (url.includes('/admin') || url.includes('/seller')) return 'Loading dashboard configuration';
    return 'Preparing next view';
  }

  private requestLabel(url: string, method: string) {
    if (url.includes('/auth/google-login') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return 'Authenticating account';
    }
    if (url.includes('/auth/forgot-password') || url.includes('/auth/reset')) {
      return 'Securing credential recovery';
    }
    if (url.includes('/payments/init') || url.includes('/payments/verify')) {
      return 'Configuring payment flow';
    }
    if (url.includes('/orders') && method === 'POST') {
      return 'Configuring order placement';
    }
    if (url.includes('/orders')) {
      return 'Syncing order timeline';
    }
    if (url.includes('/seller/apply')) {
      return 'Submitting seller configuration';
    }
    if (url.includes('/user/profile') && method !== 'GET') {
      return 'Saving profile updates';
    }
    if (url.includes('/user/profile')) {
      return 'Syncing account details';
    }
    return 'Syncing with FruitMart cloud';
  }
}
