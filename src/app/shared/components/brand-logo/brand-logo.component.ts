import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="inline-flex items-center gap-2.5 select-none" [class]="containerClass">
      <div
        class="rounded-xl bg-[var(--bg-surface-secondary)]/90 backdrop-blur-md border border-[var(--border-subtle)] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200"
        [ngClass]="{
          'w-7 h-7 p-1': size === 'xs',
          'w-9 h-9 p-1.5': size === 'sm',
          'w-11 h-11 p-2': size === 'md',
          'w-14 h-14 p-2.5': size === 'lg',
          'w-20 h-20 p-3': size === 'xl'
        }"
      >
        <img
          [src]="usePng ? 'assets/brand/shakowa-logo.png' : 'assets/brand/shakowa-logo.svg'"
          alt="شعار شكوى - Shakowa Logo"
          class="w-full h-full object-contain pointer-events-none"
          loading="eager"
        />
      </div>

      @if (showText) {
        <div class="truncate text-start">
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-[var(--text-primary)] tracking-tight" [ngClass]="size === 'lg' ? 'text-lg' : 'text-sm'">
              {{ 'brandName' | translate }}
            </span>
            <span class="text-[10px] text-[var(--color-brand-primary)] font-bold">
              | {{ 'appName' | translate }}
            </span>
          </div>
          @if (showSubtitle) {
            <span class="text-[10px] text-[var(--text-muted)] font-medium block truncate">
              Complaint Management System
            </span>
          }
        </div>
      }
    </div>
  `
})
export class BrandLogoComponent {
  translation = inject(TranslationService);

  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';
  @Input() showText = false;
  @Input() showSubtitle = true;
  @Input() usePng = false;
  @Input() containerClass = '';
}

