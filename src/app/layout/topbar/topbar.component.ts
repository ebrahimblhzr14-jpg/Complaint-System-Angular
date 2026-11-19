import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { ThemeService } from '../../core/services/theme.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <header class="h-16 bg-[var(--bg-surface)] backdrop-blur-md border-b border-[var(--border-subtle)] sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-200">
      <!-- Left side: Hamburger (mobile) & Title -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          (click)="toggleMobileSidebar.emit()"
          class="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Mobile Brand Logo -->
        <div class="lg:hidden w-8 h-8 rounded-lg bg-[var(--bg-surface-secondary)]/90 backdrop-blur-md border border-[var(--border-subtle)] p-1 flex items-center justify-center shrink-0 shadow-xs">
          <img
            src="assets/brand/shakowa-logo.svg"
            alt="Shakowa Logo"
            class="w-full h-full object-contain"
          />
        </div>

        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] shrink-0 shadow-xs shadow-[var(--color-brand-primary)]"></span>
            <span class="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
              {{ 'brandName' | translate }} • {{ 'appName' | translate }}
            </span>
          </div>
          <span class="text-[11px] text-[var(--text-secondary)] hidden md:inline-block truncate">
            {{ 'appSubtitle' | translate }}
          </span>
        </div>
      </div>

      <!-- Right side: Theme Switcher + Language Switcher + User Profile -->
      <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <!-- Light / Dark Theme Switcher Button -->
        <button
          type="button"
          (click)="themeService.toggleTheme()"
          class="flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--color-brand-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer shrink-0 shadow-xs"
          [attr.aria-label]="'themeToggle' | translate"
          [title]="themeService.currentTheme() === 'dark' ? ('themeLight' | translate) : ('themeDark' | translate)"
        >
          @if (themeService.currentTheme() === 'dark') {
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } @else {
            <svg class="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        </button>

        <!-- Language Switcher -->
        <button
          type="button"
          (click)="translation.toggleLanguage()"
          class="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer shrink-0 shadow-xs"
          [title]="translation.currentLang() === 'ar' ? ('switchToEnglish' | translate) : ('switchToArabic' | translate)"
        >
          <svg class="w-3.5 h-3.5 text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span class="hidden sm:inline">{{ translation.currentLang() === 'ar' ? 'English' : 'العربية' }}</span>
          <span class="inline sm:hidden uppercase font-mono text-[11px]">{{ translation.currentLang() === 'ar' ? 'EN' : 'عربي' }}</span>
        </button>

        <!-- User Profile Dropdown -->
        @if (auth.currentUser(); as user) {
          <div class="relative">
            <button
              type="button"
              (click)="menuOpen.set(!menuOpen())"
              class="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[var(--bg-surface-secondary)] transition-colors cursor-pointer text-start"
              aria-label="User profile menu"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C99745] to-[#D9A65A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs shadow-[#C99745]/30">
                {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div class="hidden md:flex flex-col">
                <span class="text-xs font-semibold text-[var(--text-primary)] leading-tight truncate max-w-[120px]">
                  {{ user.name }}
                </span>
                <span class="text-[10px] text-[var(--text-muted)] font-medium">
                  {{ user.role | translate:'role' }}
                </span>
              </div>
              <svg class="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu (Clamped inside viewport) -->
            @if (menuOpen()) {
              <div
                class="fixed inset-0 z-40"
                (click)="menuOpen.set(false)"
              ></div>
              <div
                class="absolute end-0 mt-2 w-56 sm:w-60 max-w-[calc(100vw-1.5rem)] bg-[var(--bg-surface-elevated)] backdrop-blur-xl rounded-xl shadow-2xl border border-[var(--border-strong)] py-2 z-50 animate-in fade-in duration-150"
              >
                <div class="px-3.5 py-2.5 border-b border-[var(--border-subtle)]">
                  <p class="text-[10px] text-[var(--text-muted)] font-medium">{{ 'loggedInAs' | translate }}</p>
                  <p class="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">{{ user.name }}</p>
                  <p class="text-[11px] text-[var(--text-secondary)] truncate">{{ user.email }}</p>
                </div>

                <div class="py-1">
                  <a
                    routerLink="/profile"
                    (click)="menuOpen.set(false)"
                    class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--color-brand-primary)] transition-colors text-start cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{{ 'profile' | translate }}</span>
                  </a>

                  <button
                    type="button"
                    (click)="logout()"
                    class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors text-start cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{{ 'logout' | translate }}</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `
})
export class TopbarComponent {
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  auth = inject(AuthService);
  translation = inject(TranslationService);
  themeService = inject(ThemeService);

  menuOpen = signal(false);

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
