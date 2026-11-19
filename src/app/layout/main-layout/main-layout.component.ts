import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    ToastContainerComponent,
    ConfirmDialogComponent,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col transition-colors duration-200">
      <!-- Sidebar -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="mobileOpen()"
        (toggleCollapse)="sidebarCollapsed.set(!sidebarCollapsed())"
        (closeMobile)="mobileOpen.set(false)"
      ></app-sidebar>

      <!-- Main Shell Area -->
      <div
        class="flex-1 flex flex-col transition-all duration-200 min-w-0 max-w-full"
        [ngClass]="{
          'lg:ms-64': !sidebarCollapsed(),
          'lg:ms-20': sidebarCollapsed()
        }"
      >
        <!-- Top Navigation -->
        <app-topbar (toggleMobileSidebar)="mobileOpen.set(!mobileOpen())"></app-topbar>

        <!-- Routed Content (Responsive Padding) -->
        <main class="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="py-4 px-4 sm:px-6 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
          {{ 'footerText' | translate }} &copy; {{ currentYear }} — Enterprise CMS Platform
        </footer>
      </div>

      <!-- Global Overlays -->
      <app-toast-container></app-toast-container>
      <app-confirm-dialog></app-confirm-dialog>
    </div>
  `
})
export class MainLayoutComponent {
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  mobileOpen = signal(false);
  currentYear = new Date().getFullYear();

  constructor() {
    // Lock body scroll when mobile drawer is open to prevent page bounce
    effect(() => {
      const open = this.mobileOpen();
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('mobile-drawer-open', open);
      }
    });

    // Automatically close mobile drawer on route navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileOpen.set(false);
    });
  }
}
