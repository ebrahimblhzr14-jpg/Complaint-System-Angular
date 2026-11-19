import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-20 inset-x-3 sm:inset-x-auto sm:end-6 z-50 flex flex-col gap-3 max-w-full sm:max-w-[340px] w-full pointer-events-none p-1 sm:p-0"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          class="pointer-events-auto relative overflow-hidden rounded-2xl p-4 border backdrop-blur-xl transition-all duration-300 transform translate-y-0 shadow-xl animate-in fade-in slide-in-from-top-2"
          [ngClass]="{
            'bg-white/95 text-[#211F1B] border-emerald-500/30 shadow-emerald-500/10 dark:bg-[#1E1C18]/95 dark:text-[#FAF8F5] dark:border-emerald-500/30': toast.type === 'success',
            'bg-white/95 text-[#211F1B] border-rose-500/30 shadow-rose-500/10 dark:bg-[#1E1C18]/95 dark:text-[#FAF8F5] dark:border-rose-500/30': toast.type === 'error',
            'bg-white/95 text-[#211F1B] border-amber-500/30 shadow-amber-500/10 dark:bg-[#1E1C18]/95 dark:text-[#FAF8F5] dark:border-amber-500/30': toast.type === 'warning',
            'bg-white/95 text-[#211F1B] border-[#C99745]/30 shadow-[#C99745]/10 dark:bg-[#1E1C18]/95 dark:text-[#FAF8F5] dark:border-[#C99745]/30': toast.type === 'info'
          }"
        >
          <!-- Top Row: Badge Pill + Dismiss Button -->
          <div class="flex items-center justify-between gap-2 mb-3">
            @if (toast.badgeText) {
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                [ngClass]="{
                  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30': toast.type === 'success',
                  'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30': toast.type === 'error',
                  'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30': toast.type === 'warning',
                  'bg-[#C99745]/15 text-[#A3742C] dark:text-[#E5B56E] border border-[#C99745]/30': toast.type === 'info'
                }"
              >
                @if (toast.type === 'success') {
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                } @else if (toast.type === 'error') {
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                } @else if (toast.type === 'warning') {
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                } @else {
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                {{ toast.badgeText }}
              </span>
            } @else {
              <span></span>
            }

            <button
              type="button"
              (click)="toastService.remove(toast.id)"
              class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content Row: Circular Icon Container + Text -->
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
              [ngClass]="{
                'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-4 ring-emerald-500/10': toast.type === 'success',
                'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 ring-4 ring-rose-500/10': toast.type === 'error',
                'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-4 ring-amber-500/10': toast.type === 'warning',
                'bg-[#C99745]/15 text-[#C99745] border-[#C99745]/30 ring-4 ring-[#C99745]/10': toast.type === 'info'
              }"
            >
              @if (toast.type === 'success') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7" />
                </svg>
              } @else if (toast.type === 'error') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              } @else if (toast.type === 'warning') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>

            <div class="flex-1 min-w-0">
              @if (toast.title) {
                <h4 class="font-bold text-sm text-[var(--text-primary)] leading-tight mb-1">
                  {{ toast.title }}
                </h4>
              }
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                {{ toast.message }}
              </p>

              <!-- Optional Highlight Box -->
              @if (toast.highlightText) {
                <div class="mt-2.5 p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--color-brand-primary)]">
                  {{ toast.highlightText }}
                </div>
              }
            </div>
          </div>

          <!-- Optional Action Button -->
          @if (toast.action) {
            <div class="mt-3.5 pt-2.5 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                (click)="onActionClick(toast)"
                class="cms-btn-primary w-full py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>{{ toast.action.label }}</span>
                <svg class="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          }

          <!-- Auto-dismiss Progress Indicator -->
          @if (toast.duration > 0) {
            <div class="absolute bottom-0 inset-x-0 h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                class="h-full toast-progress"
                [style.animation-duration.ms]="toast.duration"
                [ngClass]="{
                  'bg-emerald-500': toast.type === 'success',
                  'bg-rose-500': toast.type === 'error',
                  'bg-amber-500': toast.type === 'warning',
                  'bg-[#C99745]': toast.type === 'info'
                }"
              ></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes toast-progress-shrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    .toast-progress {
      animation: toast-progress-shrink linear forwards;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  onActionClick(toast: ToastMessage): void {
    if (toast.action) {
      toast.action.onClick();
      this.toastService.remove(toast.id);
    }
  }
}
