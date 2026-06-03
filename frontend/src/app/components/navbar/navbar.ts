import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class Navbar implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private theme = inject(ThemeService);
  private closeMenuTimer: ReturnType<typeof setTimeout> | null = null;
  menuOpen = signal(false);
  accountMenuOpen = signal(false);
  moreMenuOpen = signal(false);
  logoutConfirmOpen = signal(false);

  readonly isDark = this.theme.isDark;
  readonly themeLabel = computed(() => 'Light mode');

  isLoggedIn = this.auth.isLoggedIn;
  isAdmin = this.auth.isAdmin;
  isSeller = this.auth.isSeller;
  userName = computed(() => this.auth.user()?.name || '');
  sellerApplicationStatus = computed(() => this.auth.user()?.sellerProfile?.sellerStatus || '');
  hasSellerApplication = computed(() => !!this.auth.user()?.sellerProfile?.appliedAt);

  sellerStatusChipClass = computed(() => {
    const status = this.sellerApplicationStatus();
    if (status === 'pending') return 'border border-amber-400/40 bg-amber-500/15 text-amber-200';
    if (status === 'rejected') return 'border border-rose-400/40 bg-rose-500/15 text-rose-200';
    if (status === 'approved') return 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200';
    return 'border border-slate-600 bg-slate-800 text-slate-200';
  });

  sellerStatusLabel = computed(() => {
    const status = this.sellerApplicationStatus();
    if (status === 'pending') return 'Seller Pending';
    if (status === 'rejected') return 'Seller Rejected';
    if (status === 'approved') return 'Seller Approved';
    return '';
  });

  ngOnInit() {
    // Keep role-based nav in sync (user -> seller approval flow) without requiring logout/login.
    if (this.isLoggedIn()) {
      this.auth.refreshProfile().subscribe();
    }
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  toggleAccountMenu() {
    this.cancelScheduledClose();
    const nextState = !this.accountMenuOpen();
    this.accountMenuOpen.set(nextState);
    if (nextState) this.moreMenuOpen.set(false);
  }

  toggleMoreMenu() {
    this.cancelScheduledClose();
    const nextState = !this.moreMenuOpen();
    this.moreMenuOpen.set(nextState);
    if (nextState) this.accountMenuOpen.set(false);
  }

  toggleTheme() {
    // Theme switching disabled — app is always light.
  }

  closeDesktopMenus() {
    this.cancelScheduledClose();
    this.accountMenuOpen.set(false);
    this.moreMenuOpen.set(false);
  }

  scheduleDesktopMenuClose() {
    this.cancelScheduledClose();
    this.closeMenuTimer = setTimeout(() => {
      this.accountMenuOpen.set(false);
      this.moreMenuOpen.set(false);
      this.closeMenuTimer = null;
    }, 120);
  }

  cancelScheduledClose() {
    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }
  }

  onNavigateFromMenu() {
    this.closeDesktopMenus();
    this.menuOpen.set(false);
  }

  logout() {
    this.onNavigateFromMenu();
    this.logoutConfirmOpen.set(true);
  }

  cancelLogout() {
    this.logoutConfirmOpen.set(false);
  }

  confirmLogout() {
    this.logoutConfirmOpen.set(false);

    this.auth.logout();
    this.router.navigate(['/']);
    this.onNavigateFromMenu();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.logoutConfirmOpen()) {
      this.cancelLogout();
    }
  }
}
