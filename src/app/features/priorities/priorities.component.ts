import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrioritiesService } from '../../core/services/priorities.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { PriorityDto } from '../../core/models';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-priorities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {{ 'priorities' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {{ 'prioritiesManagementSubtitle' | translate }}
          </p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="cms-btn-primary text-xs px-4 py-2.5 self-start sm:self-auto shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ 'addPriority' | translate }}</span>
        </button>
      </div>

      <!-- Priorities Table -->
      @if (isLoading()) {
        <app-loading-skeleton [count]="3"></app-loading-skeleton>
      } @else if (priorities().length === 0) {
        <app-empty-state
          [title]="'noPrioritiesTitle' | translate"
          [description]="'noPrioritiesDesc' | translate"
        ></app-empty-state>
      } @else {
        <div class="cms-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[500px] text-start border-collapse text-xs">
              <thead>
                <tr class="bg-[var(--bg-surface-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 text-start">#</th>
                  <th class="py-3 px-4 text-start">{{ 'name' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'level' | translate }}</th>
                  <th class="py-3 px-4 text-end">{{ 'actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border-subtle)] font-medium">
                @for (p of priorities(); track p.id) {
                  <tr class="hover:bg-[var(--bg-surface-secondary)]/60 transition-colors">
                    <td class="py-3 px-4 text-[var(--text-muted)] font-mono text-[11px]">#{{ p.id }}</td>
                    <td class="py-3 px-4 font-bold text-[var(--text-primary)]">{{ p.name }}</td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                        {{ 'importanceLevelPrefix' | translate }}: {{ p.level }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-end">
                      <button
                        type="button"
                        (click)="openEditModal(p)"
                        class="cms-btn-secondary px-2.5 py-1 text-[11px]"
                      >
                        {{ 'edit' | translate }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Priority Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm" (click)="showModal.set(false)"></div>
          <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10 space-y-4 border border-[var(--border-strong)]">
            <h3 class="text-base font-bold text-[var(--text-primary)]">
              {{ (editingId ? 'editPriority' : 'addPriority') | translate }}
            </h3>

            <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">{{ 'name' | translate }} *</label>
                <input type="text" formControlName="name" class="cms-input text-xs" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">{{ 'level' | translate }} *</label>
                <input type="number" formControlName="level" class="cms-input text-xs" min="1" max="10" />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button type="button" (click)="showModal.set(false)" class="cms-btn-secondary text-xs px-4 py-2">
                  {{ 'cancel' | translate }}
                </button>
                <button type="submit" [disabled]="form.invalid || isSaving()" class="cms-btn-primary text-xs px-5 py-2">
                  {{ 'save' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PrioritiesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private prioritiesService = inject(PrioritiesService);
  private toast = inject(ToastService);
  translation = inject(TranslationService);

  priorities = signal<PriorityDto[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isSaving = signal(false);
  editingId: number | null = null;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    level: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.loadPriorities();
  }

  loadPriorities(): void {
    this.isLoading.set(true);
    this.prioritiesService.getAll().subscribe({
      next: (res) => {
        this.priorities.set(res || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.form.reset({ level: 1 });
    this.showModal.set(true);
  }

  openEditModal(p: PriorityDto): void {
    this.editingId = p.id;
    this.form.patchValue({
      name: p.name,
      level: p.level
    });
    this.showModal.set(true);
  }

  onSave(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    if (this.editingId) {
      this.prioritiesService.update(this.editingId, this.form.value).subscribe({
        next: () => {
          this.showModal.set(false);
          this.isSaving.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.success(isAr ? 'تم تحديث الأولوية بنجاح' : 'Priority updated successfully');
          this.loadPriorities();
        },
        error: (err) => {
          this.isSaving.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.error(err.error?.message || (isAr ? 'تعذر تحديث الأولوية' : 'Failed to update priority'));
        }
      });
    } else {
      this.prioritiesService.create(this.form.value).subscribe({
        next: () => {
          this.showModal.set(false);
          this.isSaving.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.success(isAr ? 'تمت إضافة الأولوية بنجاح' : 'Priority added successfully');
          this.loadPriorities();
        },
        error: (err) => {
          this.isSaving.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.error(err.error?.message || (isAr ? 'تعذر إضافة الأولوية' : 'Failed to add priority'));
        }
      });
    }
  }
}
