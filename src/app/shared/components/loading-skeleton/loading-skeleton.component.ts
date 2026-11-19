import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 animate-pulse">
      @for (item of rows; track $index) {
        <div class="h-16 bg-[var(--bg-surface-secondary)]/80 rounded-xl w-full border border-[var(--border-subtle)]"></div>
      }
    </div>
  `
})
export class LoadingSkeletonComponent {
  @Input() count: number = 4;
  get rows(): number[] {
    return Array.from({ length: this.count });
  }
}

