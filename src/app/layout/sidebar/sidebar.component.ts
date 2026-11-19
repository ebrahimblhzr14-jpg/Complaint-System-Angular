import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface NavItem {
  labelKey: string;
  route: string;
  icon: string;
  roles?: string[]; // Allowed roles (if omitted, all authenticated users)
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, TranslatePipe],
  template: `
    <!-- Mobile Backdrop -->
    @if (mobileOpen) {
      <div
        class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        (click)="closeMobile.emit()"
        aria-hidden="true"
      ></div>
    }

    <!-- Sidebar Container (Responsive Off-Canvas Drawer on Mobile, Fixed Sidebar on Desktop) -->
    <aside
      class="app-sidebar-drawer fixed inset-y-0 start-0 z-40 flex flex-col bg-[var(--bg-surface)] backdrop-blur-xl text-[var(--text-primary)] border-e border-[var(--border-subtle)]"
      [ngClass]="{
        'w-64': !collapsed,
        'w-20': collapsed,
        'mobile-open': mobileOpen
      }"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] shrink-0">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-9 h-9 rounded-xl bg-[var(--bg-surface-secondary)]/90 backdrop-blur-md border border-[var(--border-subtle)] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
            <img
              src="assets/brand/shakowa-logo.svg"
              alt="Shakowa Logo"
              class="w-full h-full object-contain"
            />
          </div>
          @if (!collapsed) {
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-sm leading-tight text-[var(--text-primary)] tracking-tight">{{ 'brandName' | translate }}</span>
                <span class="text-[10px] text-[var(--color-brand-primary)] font-bold">| {{ 'appName' | translate }}</span>
              </div>
              <span class="text-[10px] text-[var(--text-muted)] font-medium block truncate">{{ 'complaintManagement' | translate }}</span>
            </div>
          }
        </div>

        <!-- Desktop Collapse Toggle -->
        <button
          type="button"
          (click)="toggleCollapse.emit()"
          class="hidden lg:flex w-7 h-7 rounded-md items-center justify-center hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          [title]="'toggleSidebar' | translate"
        >
          <svg class="w-4 h-4 transform transition-transform" [ngClass]="{ 'rotate-180': collapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Mobile Close "X" Button -->
        <button
          type="button"
          (click)="closeMobile.emit()"
          class="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="Close navigation menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- User Role Indicator -->
      @if (!collapsed && auth.currentUser()) {
        <div class="px-4 py-2.5 bg-[var(--bg-surface-secondary)]/50 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] shadow-xs shadow-[var(--color-brand-primary)]"></span>
          <span class="text-xs text-[var(--text-secondary)] truncate">
            {{ auth.currentUser()?.role | translate:'role' }}
          </span>
        </div>
      }

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        @for (item of filteredNavItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-[var(--color-brand-primary-subtle)] text-[var(--color-brand-primary)] font-semibold"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            (click)="closeMobile.emit()"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs group"
            [title]="collapsed ? (item.labelKey | translate) : ''"
          >
            <!-- SVG Icons based on item.icon -->
            <div class="shrink-0 w-4.5 h-4.5 flex items-center justify-center group-hover:text-[var(--color-brand-primary)]">
              @if (item.icon === 'dashboard') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              } @else if (item.icon === 'plus-circle') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } @else if (item.icon === 'list') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              } @else if (item.icon === 'users') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else if (item.icon === 'folder') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              } @else if (item.icon === 'flag') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              } @else if (item.icon === 'check-circle') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } @else if (item.icon === 'user') {
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            </div>

            @if (!collapsed) {
              <span class="truncate">{{ item.labelKey | translate }}</span>
            }
          </a>
        }
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-[var(--border-subtle)] shrink-0">
        <button
          type="button"
          (click)="auth.logout()"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors text-xs cursor-pointer"
          [title]="collapsed ? ('logout' | translate) : ''"
        >
          <svg class="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          @if (!collapsed) {
            <span class="truncate font-semibold">{{ 'logout' | translate }}</span>
          }
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  auth = inject(AuthService);
  translation = inject(TranslationService);

  readonly navItems: NavItem[] = [
    {
      labelKey: 'dashboard',
      route: '/dashboard',
      icon: 'dashboard',
      roles: ['Admin', 'SuperAdmin']
    },
    {
      labelKey: 'newComplaint',
      route: '/complaints/new',
      icon: 'plus-circle'
    },
    {
      labelKey: 'complaints',
      route: '/complaints',
      icon: 'list'
    },
    {
      labelKey: 'users',
      route: '/users',
      icon: 'users',
      roles: ['SuperAdmin']
    },
    {
      labelKey: 'categories',
      route: '/categories',
      icon: 'folder',
      roles: ['Admin', 'SuperAdmin']
    },
    {
      labelKey: 'priorities',
      route: '/priorities',
      icon: 'flag',
      roles: ['Admin', 'SuperAdmin']
    },
    {
      labelKey: 'statuses',
      route: '/statuses',
      icon: 'check-circle',
      roles: ['Admin', 'SuperAdmin']
    },
    {
      labelKey: 'profile',
      route: '/profile',
      icon: 'user'
    }
  ];

  get filteredNavItems(): NavItem[] {
    const role = this.auth.currentUser()?.role;
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      if (!role) return false;
      return item.roles.includes(role);
    });
  }
}
