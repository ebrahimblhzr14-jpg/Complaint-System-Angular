import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ComplaintsService } from '../../../core/services/complaints.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { PrioritiesService } from '../../../core/services/priorities.service';
import { AttachmentsService } from '../../../core/services/attachments.service';
import { ToastService } from '../../../core/services/toast.service';
import { CategoryDto, PriorityDto } from '../../../core/models';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-complaint-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Breadcrumb / Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {{ 'newComplaint' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {{ 'newComplaintSubtitle' | translate }}
          </p>
        </div>

        <a routerLink="/complaints" class="cms-btn-secondary text-xs px-3.5 py-2">
          {{ 'back' | translate }}
        </a>
      </div>

      <!-- Main Form Card -->
      <div class="cms-card p-6 sm:p-8 bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs rounded-xl">
        @if (loadError()) {
          <div class="p-3 mb-5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>{{ 'lookupsLoadError' | translate }}</span>
            </div>
            <button
              type="button"
              (click)="loadLookups()"
              class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold cursor-pointer transition-colors"
            >
              {{ 'retry' | translate }}
            </button>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              {{ 'complaintTitle' | translate }} *
            </label>
            <input
              type="text"
              formControlName="title"
              [placeholder]="'complaintTitlePlaceholder' | translate"
              class="cms-input"
              [ngClass]="{ 'cms-input-error': form.get('title')?.touched && form.get('title')?.invalid }"
            />
            @if (form.get('title')?.touched && form.get('title')?.errors?.['required']) {
              <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'complaintTitleRequired' | translate }}</p>
            }
          </div>

          <!-- Category & Priority Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Category -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                {{ 'category' | translate }} *
              </label>
              <select
                formControlName="categoryId"
                class="cms-input"
                [ngClass]="{ 'cms-input-error': form.get('categoryId')?.touched && form.get('categoryId')?.invalid }"
              >
                <option [ngValue]="null" disabled>{{ 'selectCategoryDefault' | translate }}</option>
                @for (c of categories(); track c.id) {
                  <option [ngValue]="c.id">{{ c.id | translate:'category':c.name }}</option>
                }
              </select>
              @if (form.get('categoryId')?.touched && form.get('categoryId')?.errors?.['required']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'categoryRequired' | translate }}</p>
              }
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                {{ 'priority' | translate }} *
              </label>
              <select
                formControlName="priorityId"
                class="cms-input"
                [ngClass]="{ 'cms-input-error': form.get('priorityId')?.touched && form.get('priorityId')?.invalid }"
              >
                <option [ngValue]="null" disabled>{{ 'selectPriorityDefault' | translate }}</option>
                @for (p of priorities(); track p.id) {
                  <option [ngValue]="p.id">{{ p.id | translate:'priority':p.name }} ({{ 'level' | translate }} {{ p.level }})</option>
                }
              </select>
              @if (form.get('priorityId')?.touched && form.get('priorityId')?.errors?.['required']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'priorityRequired' | translate }}</p>
              }
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              {{ 'complaintDescription' | translate }} *
            </label>
            <textarea
              formControlName="description"
              rows="5"
              [placeholder]="'complaintDescPlaceholder' | translate"
              class="cms-input resize-y"
              [ngClass]="{ 'cms-input-error': form.get('description')?.touched && form.get('description')?.invalid }"
            ></textarea>
            @if (form.get('description')?.touched && form.get('description')?.errors?.['required']) {
              <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'complaintDescRequired' | translate }}</p>
            }
          </div>

          <!-- Optional Image Attachment -->
          <div class="p-4 bg-[var(--bg-surface-secondary)]/60 backdrop-blur-sm border border-[var(--border-subtle)] rounded-xl space-y-2">
            <label class="block text-xs font-semibold text-[var(--text-primary)]">
              {{ 'uploadAttachment' | translate }} ({{ 'optional' | translate }})
            </label>
            <p class="text-[11px] text-[var(--text-secondary)]">
              {{ 'uploadAttachmentFormats' | translate }}
            </p>
            <input
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              class="text-xs text-[var(--text-secondary)] file:me-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-brand-primary-subtle)] file:text-[var(--color-brand-primary)] cursor-pointer"
            />
            @if (selectedFileName()) {
              <p class="text-xs text-[var(--color-brand-primary)] font-medium">{{ 'selectedFilePrefix' | translate }} {{ selectedFileName() }}</p>
            }
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <a routerLink="/complaints" class="cms-btn-secondary px-5 py-2.5 text-xs">
              {{ 'cancel' | translate }}
            </a>
            <button
              type="submit"
              [disabled]="form.invalid || isSubmitting()"
              class="cms-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center justify-center transition-all"
              [ngClass]="{
                'opacity-60 cursor-not-allowed pointer-events-none': form.invalid || isSubmitting(),
                'cursor-pointer': !form.invalid && !isSubmitting()
              }"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin -ms-1 me-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ 'loading' | translate }}</span>
              } @else {
                <span>{{ 'submitComplaint' | translate }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ComplaintCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private complaintsService = inject(ComplaintsService);
  private categoriesService = inject(CategoriesService);
  private prioritiesService = inject(PrioritiesService);
  private attachmentsService = inject(AttachmentsService);
  private toast = inject(ToastService);
  private router = inject(Router);
  translation = inject(TranslationService);

  categories = signal<CategoryDto[]>([]);
  priorities = signal<PriorityDto[]>([]);
  isSubmitting = signal(false);
  isLoadingLookups = signal(false);
  loadError = signal(false);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    categoryId: [null, [Validators.required]],
    priorityId: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups(): void {
    this.isLoadingLookups.set(true);
    this.loadError.set(false);

    forkJoin({
      categories: this.categoriesService.getAll().pipe(
        catchError(() => of([] as CategoryDto[]))
      ),
      priorities: this.prioritiesService.getAll().pipe(
        catchError(() => of([] as PriorityDto[]))
      )
    }).subscribe({
      next: ({ categories, priorities }) => {
        if (categories.length > 0) {
          this.categories.set(categories.filter((c) => c.isActive !== false));
        }
        if (priorities.length > 0) {
          this.priorities.set(priorities);
        }

        if (categories.length === 0 && priorities.length === 0 && this.categories().length === 0) {
          this.loadError.set(true);
        } else {
          this.loadError.set(false);
        }
        this.isLoadingLookups.set(false);
      },
      error: () => {
        this.isLoadingLookups.set(false);
        if (this.categories().length === 0 || this.priorities().length === 0) {
          this.loadError.set(true);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.selectedFileName.set(input.files[0].name);
    }
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const dto = this.form.value;

    this.complaintsService.create(dto).subscribe({
      next: (complaint) => {
        const isAr = this.translation.currentLang() === 'ar';
        this.toast.success(
          isAr
            ? 'تم تسجيل الشكوى بنجاح برقم #' + complaint.id
            : 'Complaint registered successfully with ID #' + complaint.id,
          this.translation.translate('toastSuccess')
        );

        // If user chose a file, attempt upload
        const file = this.selectedFile();
        if (file && complaint.id) {
          this.attachmentsService.upload(complaint.id, file).subscribe({
            next: () => {
              this.toast.info(this.translation.translate('attachmentUploadedSuccess'));
              this.router.navigate(['/complaints', complaint.id]);
            },
            error: () => {
              // Graceful notice as documented in integration issues
              this.router.navigate(['/complaints', complaint.id]);
            }
          });
        } else {
          this.router.navigate(['/complaints', complaint.id]);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Prevent duplicate toast if authInterceptor already notified user (e.g. 429, 500, 403, 0)
        if (!err?.handledByInterceptor && err?.status !== 429 && err?.status !== 500 && err?.status !== 403 && err?.status !== 0) {
          const message = err.error?.message || this.translation.translate('complaintCreateError');
          this.toast.error(message);
        }
      }
    });
  }
}

