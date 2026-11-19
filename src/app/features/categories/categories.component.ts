import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesService } from '../../core/services/categories.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { TranslationService } from '../../core/services/translation.service';
import { CategoryDto } from '../../core/models';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-categories',
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
            {{ 'categories' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {{ 'categoriesManagementSubtitle' | translate }}
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
          <span>{{ 'addCategory' | translate }}</span>
        </button>
      </div>

      <!-- Categories Table -->
      @if (isLoading()) {
        <app-loading-skeleton [count]="4"></app-loading-skeleton>
      } @else if (categories().length === 0) {
        <app-empty-state
          [title]="'noCategoriesTitle' | translate"
          [description]="'noCategoriesDesc' | translate"
        ></app-empty-state>
      } @else {
        <div class="cms-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[540px] text-start border-collapse text-xs">
              <thead>
                <tr class="bg-[var(--bg-surface-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 text-start">#</th>
                  <th class="py-3 px-4 text-start">{{ 'name' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'description' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'status' | translate }}</th>
                  <th class="py-3 px-4 text-end">{{ 'actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border-subtle)] font-medium">
                @for (c of categories(); track c.id) {
                  <tr class="hover:bg-[var(--bg-surface-secondary)]/60 transition-colors">
                    <td class="py-3 px-4 text-[var(--text-muted)] font-mono text-[11px]">#{{ c.id }}</td>
                    <td class="py-3 px-4 font-bold text-[var(--text-primary)]">{{ c.name }}</td>
                    <td class="py-3 px-4 text-[var(--text-secondary)]">{{ c.description || '—' }}</td>
                    <td class="py-3 px-4">
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="c.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]'"
                      >
                        {{ (c.isActive ? 'active' : 'inactive') | translate }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-end">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          (click)="toggleActive(c)"
                          class="text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                          [ngClass]="c.isActive ? 'text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20' : 'text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'"
                        >
                          {{ (c.isActive ? 'deactivate' : 'activate') | translate }}
                        </button>
                        <button
                          type="button"
                          (click)="openEditModal(c)"
                          class="cms-btn-secondary px-2.5 py-1 text-[11px]"
                        >
                          {{ 'edit' | translate }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Category Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm" (click)="showModal.set(false)"></div>
          <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10 space-y-4 border border-[var(--border-strong)]">
            <h3 class="text-base font-bold text-[var(--text-primary)]">
              {{ (editingId ? 'editCategory' : 'addCategory') | translate }}
            </h3>

            <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">{{ 'name' | translate }} *</label>
                <input type="text" formControlName="name" class="cms-input text-xs" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">{{ 'description' | translate }}</label>
                <textarea formControlName="description" rows="3" class="cms-input text-xs resize-y"></textarea>
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
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  translation = inject(TranslationService);

  categories = signal<CategoryDto[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isSaving = signal(false);
  editingId: number | null = null;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(300)]]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoriesService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.form.reset();
    this.showModal.set(true);
  }

  openEditModal(cat: CategoryDto): void {
    this.editingId = cat.id;
    this.form.patchValue({
      name: cat.name,
      description: cat.description
    });
    this.showModal.set(true);
  }

  onSave(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    if (this.editingId) {
      this.categoriesService
        .update(this.editingId, {
          name: this.form.value.name,
          description: this.form.value.description,
          isActive: true
        })
        .subscribe({
          next: () => {
            this.showModal.set(false);
            this.isSaving.set(false);
            const isAr = this.translation.currentLang() === 'ar';
            this.toast.success(isAr ? 'تم تحديث التصنيف بنجاح' : 'Category updated successfully');
            this.loadCategories();
          },
          error: (err) => {
            this.isSaving.set(false);
            const isAr = this.translation.currentLang() === 'ar';
            this.toast.error(err.error?.message || (isAr ? 'تعذر تحديث التصنيف' : 'Failed to update category'));
          }
        });
    } else {
      this.categoriesService.create(this.form.value).subscribe({
        next: () => {
          this.showModal.set(false);
          this.isSaving.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.success(isAr ? 'تمت إضافة التصنيف بنجاح' : 'Category added successfully');
          this.loadCategories();
        },
        error: (err) => {
          this.isSaving.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.error(err.error?.message || (isAr ? 'تعذر إضافة التصنيف' : 'Failed to add category'));
        }
      });
    }
  }

  async toggleActive(cat: CategoryDto): Promise<void> {
    const isAr = this.translation.currentLang() === 'ar';
    const actionLabel = cat.isActive
      ? this.translation.translate('deactivate')
      : this.translation.translate('activate');
    const confirmed = await this.modal.confirm({
      title: `${actionLabel} ${this.translation.translate('category')}`,
      message: isAr
        ? `هل أنت متأكد من رغبتك في ${actionLabel} تصنيف "${cat.name}"؟`
        : `Are you sure you want to ${actionLabel.toLowerCase()} category "${cat.name}"?`,
      isDanger: cat.isActive,
      confirmText: actionLabel
    });

    if (!confirmed) return;

    const op = cat.isActive
      ? this.categoriesService.deactivate(cat.id)
      : this.categoriesService.activate(cat.id);

    op.subscribe({
      next: () => {
        this.categories.update((list) =>
          list.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
        );
        this.toast.success(
          isAr
            ? `تم ${actionLabel} التصنيف بنجاح`
            : `Category ${actionLabel.toLowerCase()}d successfully`
        );
      },
      error: () =>
        this.toast.error(
          isAr ? `تعذر ${actionLabel} التصنيف حالياً` : `Failed to ${actionLabel.toLowerCase()} category`
        )
    });
  }
}
