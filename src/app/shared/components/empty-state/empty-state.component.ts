import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cms-card p-10 md:p-14 text-center flex flex-col items-center justify-center my-6 relative overflow-hidden">
      <!-- Ambient Glow Behind Icon -->
      <div class="absolute -top-12 -start-12 w-48 h-48 bg-[#C99745]/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Icon Container (Matching Card 8) -->
      <div class="w-16 h-16 rounded-2xl bg-[#C99745]/10 border border-[#C99745]/30 ring-8 ring-[#C99745]/5 flex items-center justify-center mb-5 text-[#C99745] shadow-sm">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-base md:text-lg font-bold text-[var(--text-primary)] mb-2">
        {{ displayTitle }}
      </h3>

      <!-- Description -->
      <p class="text-xs md:text-sm text-[var(--text-secondary)] max-w-md mb-6 leading-relaxed">
        {{ displayDescription }}
      </p>

      <!-- Action Button (via Input) -->
      @if (actionText && actionRoute) {
        <a
          [routerLink]="actionRoute"
          class="cms-btn-primary px-5 py-2.5 text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ actionText }}</span>
        </a>
      } @else if (actionText) {
        <button
          type="button"
          (click)="actionClick.emit()"
          class="cms-btn-primary px-5 py-2.5 text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ actionText }}</span>
        </button>
      }

      <!-- Custom Action Slots (Projection) -->
      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  private translation = inject(TranslationService);

  @Input() title?: string;
  @Input() description?: string;
  @Input() actionText?: string;
  @Input() actionRoute?: string | any[];
  @Output() actionClick = new EventEmitter<void>();

  get displayTitle(): string {
    return this.title || this.translation.translate('defaultEmptyTitle');
  }

  get displayDescription(): string {
    return this.description || this.translation.translate('defaultEmptyDesc');
  }
}
