import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class Footer {
  private auth = inject(AuthService);

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly isAdmin = this.auth.isAdmin;
  readonly year = new Date().getFullYear();
  readonly accountLinks = computed(() =>
    this.isAdmin()
      ? [
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Orders Monitor', href: '/admin' },
          { label: 'Catalog Control', href: '/admin' },
        ]
      : this.isLoggedIn()
        ? [
            { label: 'Your Dashboard', href: '/dashboard' },
            { label: 'Track Orders', href: '/track-order' },
            { label: 'Profile & Settings', href: '/profile' },
          ]
        : [
            { label: 'Sign In', href: '/login' },
            { label: 'Create Account', href: '/register' },
            { label: 'Why FruitMart', href: '/about' },
          ],
  );

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}