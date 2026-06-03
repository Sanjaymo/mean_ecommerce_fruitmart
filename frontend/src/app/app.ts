import { Component, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { AuthService } from './services/auth';
import { UiMotionService } from './services/ui-motion';
import { NetworkStatusService } from './services/network-status';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { style: 'display: block' }
})
export class App {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected motion = inject(UiMotionService);
  protected network = inject(NetworkStatusService);
  protected theme = inject(ThemeService);

  protected readonly title = signal('my-angular-app');

  constructor() {
    this.theme.init();
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.motion.startNavigation(event.url);
          return;
        }

        this.motion.endNavigation();
        if (event instanceof NavigationEnd && this.auth.isLoggedIn()) {
          this.auth.refreshProfile().subscribe();
        }
      });
  }
}
