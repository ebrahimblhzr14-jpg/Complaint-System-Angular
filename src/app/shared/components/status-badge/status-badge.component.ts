import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="cms-badge"
      [ngClass]="badgeClass"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ displayLabel }}
    </span>
  `
})
export class StatusBadgeComponent {
  private translation = inject(TranslationService);

  @Input() statusId: number = 1;
  @Input() label?: string;

  get displayLabel(): string {
    return this.translation.translateStatus(this.statusId, this.label);
  }

  get badgeClass(): string {
    if (this.isRejected) {
      return 'cms-badge-danger';
    }
    switch (this.statusId) {
      case 1:
        return 'cms-badge-pending';
      case 2:
        return 'cms-badge-inprogress';
      case 3:
        return 'cms-badge-closed';
      case 4:
        return 'cms-badge-danger';
      case 5:
        return 'cms-badge-resolved';
      default:
        return 'cms-badge-pending';
    }
  }

  get dotClass(): string {
    if (this.isRejected) {
      return 'bg-[#B85C55]';
    }
    switch (this.statusId) {
      case 1:
        return 'bg-[#879477]';
      case 2:
        return 'bg-[#C58A3A]';
      case 3:
        return 'bg-[#817C72]';
      case 4:
        return 'bg-[#B85C55]';
      case 5:
        return 'bg-[#54856A]';
      default:
        return 'bg-[#879477]';
    }
  }

  private get isRejected(): boolean {
    if (this.statusId === 4) {
      return true;
    }
    if (this.label) {
      const lower = this.label.toLowerCase();
      return lower.includes('مرفوض') || lower.includes('رفض') || lower.includes('reject');
    }
    return false;
  }
}
