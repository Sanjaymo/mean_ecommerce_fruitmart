import { Injectable, NgZone, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private readonly onlineState = signal(true);
  readonly isOnline = this.onlineState.asReadonly();

  constructor(private zone: NgZone) {
    if (typeof window === 'undefined') {
      this.onlineState.set(true);
      return;
    }

    this.onlineState.set(navigator.onLine);

    window.addEventListener('online', () => {
      this.zone.run(() => this.onlineState.set(true));
    });

    window.addEventListener('offline', () => {
      this.zone.run(() => this.onlineState.set(false));
    });
  }

  retryConnection() {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}
