import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- 1. Confirmation Dialog (Cards 1 & 2 in Reference Image) -->
    @if (modalService.isOpen()) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title'"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          (click)="modalService.handleCancel()"
        ></div>

        <!-- Dialog Box -->
        <div
          class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-strong)] z-10 animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Top Row: Badge Pill & Close Button -->
          <div class="flex items-center justify-between gap-2 mb-5">
            <!-- Badge Pill -->
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight"
              [ngClass]="{
                'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25': modalService.options().isDanger,
                'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25': modalService.options().type === 'warning',
                'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25': modalService.options().type === 'success',
                'bg-[var(--color-brand-primary-subtle)] text-[var(--color-brand-primary)] border border-[var(--border-strong)]': !modalService.options().isDanger && modalService.options().type !== 'warning' && modalService.options().type !== 'success'
              }"
            >
              <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                'bg-rose-500': modalService.options().isDanger,
                'bg-amber-500': modalService.options().type === 'warning',
                'bg-emerald-500': modalService.options().type === 'success',
                'bg-[var(--color-brand-primary)]': !modalService.options().isDanger && modalService.options().type !== 'warning' && modalService.options().type !== 'success'
              }"></span>
              {{ modalService.options().badgeText }}
            </span>

            <!-- Close Button (X) -->
            <button
              type="button"
              (click)="modalService.handleCancel()"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Centered Circular Icon -->
          <div
            class="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center mb-4 transition-transform duration-200"
            [ngClass]="{
              'bg-rose-500/10 text-rose-500 border border-rose-500/25 ring-8 ring-rose-500/5': modalService.options().isDanger,
              'bg-amber-500/10 text-amber-500 border border-amber-500/25 ring-8 ring-amber-500/5': modalService.options().type === 'warning',
              'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 ring-8 ring-emerald-500/5': modalService.options().type === 'success',
              'bg-[var(--color-brand-primary-subtle)] text-[var(--color-brand-primary)] border border-[var(--border-strong)] ring-8 ring-[var(--color-brand-primary)]/5': !modalService.options().isDanger && modalService.options().type !== 'warning' && modalService.options().type !== 'success'
            }"
          >
            @if (modalService.options().isDanger) {
              <!-- Trash / Danger Icon -->
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            } @else if (modalService.options().type === 'warning') {
              <!-- Warning Triangle -->
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else if (modalService.options().type === 'success') {
              <!-- Success Checkmark -->
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            } @else {
              <!-- Action Question / Shield -->
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>

          <!-- Centered Content -->
          <div class="text-center mb-6">
            <h3 id="dialog-title" class="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight mb-2">
              {{ modalService.options().title }}
            </h3>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
              {{ modalService.options().message }}
            </p>

            @if (modalService.options().highlightText) {
              <div class="mt-3 inline-block px-3 py-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--color-brand-primary)]">
                {{ modalService.options().highlightText }}
              </div>
            }
          </div>

          <!-- Action Buttons (Stacked in Reference Image) -->
          <div class="space-y-2">
            <button
              type="button"
              (click)="modalService.handleConfirm()"
              [ngClass]="modalService.options().isDanger ? 'cms-btn-danger' : 'cms-btn-primary'"
              class="w-full py-2.5 text-xs font-bold cursor-pointer shadow-sm"
            >
              {{ modalService.options().confirmText }}
            </button>
            <button
              type="button"
              (click)="modalService.handleCancel()"
              class="cms-btn-secondary w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              {{ modalService.options().cancelText }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- 2. Global Progress Loading Dialog (Card 7 in Reference Image) -->
    @if (modalService.isLoadingOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#211F1B]/65 backdrop-blur-md transition-opacity"></div>
        <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-strong)] z-10 text-center animate-in fade-in zoom-in-95 duration-200">
          <!-- Shakowa Brand Loading Indicator -->
          <div class="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div class="absolute -inset-1 rounded-2xl border-2 border-[var(--color-brand-primary-subtle)] border-t-[var(--color-brand-primary)] animate-spin"></div>
            <div class="w-12 h-12 rounded-xl bg-[var(--bg-surface-secondary)]/90 backdrop-blur-md border border-[var(--border-subtle)] p-2 flex items-center justify-center shadow-xs">
              <img
                src="assets/brand/shakowa-logo.svg"
                alt="Shakowa Logo"
                class="w-full h-full object-contain"
              />
            </div>
          </div>

          <h3 class="text-base font-bold text-[var(--text-primary)] mb-1">
            {{ modalService.loadingOptions().title }}
          </h3>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
            {{ modalService.loadingOptions().description }}
          </p>

          <!-- Smooth Progress Line -->
          <div class="h-1.5 w-full bg-[var(--bg-surface-secondary)] rounded-full overflow-hidden mt-5">
            <div class="h-full bg-gradient-to-r from-[#C99745] to-[#D9A65A] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    }

    <!-- 3. Attachment Preview Dialog (Card 9 in Reference Image) -->
    @if (modalService.isPreviewOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-[#211F1B]/70 backdrop-blur-md transition-opacity"
          (click)="modalService.closeAttachmentPreview()"
        ></div>

        <!-- Preview Dialog Card -->
        <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[var(--border-strong)] z-10 animate-in fade-in zoom-in-95 duration-200">
          <!-- Header: Filename Pill & Close Button -->
          <div class="flex items-center justify-between gap-3 mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] truncate max-w-[240px]">
              <svg class="w-3.5 h-3.5 text-[var(--color-brand-primary)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="truncate">{{ modalService.previewOptions().fileName }}</span>
            </span>

            <button
              type="button"
              (click)="modalService.closeAttachmentPreview()"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Image Preview with Overlay Tag -->
          <div class="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-main)] mb-4">
            <img
              [src]="modalService.previewOptions().imageUrl"
              [alt]="modalService.previewOptions().fileName"
              class="w-full h-auto object-cover max-h-80"
            />
            <div class="absolute bottom-2.5 start-2.5 px-2.5 py-1 rounded-md bg-[#211F1B]/75 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
              {{ modalService.previewOptions().fileSize }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <a
              [href]="modalService.previewOptions().imageUrl"
              target="_blank"
              download
              class="cms-btn-primary flex-1 py-2.5 text-xs font-bold text-center inline-flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{{ 'downloadAttachmentBtn' | translate }}</span>
            </a>

            @if (modalService.previewOptions().canDelete) {
              <button
                type="button"
                (click)="modalService.handlePreviewDelete()"
                class="cms-btn-danger p-2.5 text-xs shrink-0 rounded-xl"
                [title]="'deleteAttachmentBtn' | translate"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  modalService = inject(ModalService);
}
