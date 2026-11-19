import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComplaintsService } from '../../../core/services/complaints.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { StatusesService } from '../../../core/services/statuses.service';
import { PrioritiesService } from '../../../core/services/priorities.service';
import { ModalService } from '../../../core/services/modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { ComplaintDto, CategoryDto, StatusDto, PriorityDto } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadgeComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {{ auth.isSuperAdmin() ? ('allComplaints' | translate) : ('myComplaints' | translate) }}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {{ 'complaintsSubtitle' | translate }}
          </p>
        </div>

        <a
          routerLink="/complaints/new"
          class="cms-btn-accent text-xs px-4 py-2.5 self-start sm:self-auto shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ 'newComplaint' | translate }}</span>
        </a>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="cms-card p-4 flex flex-col md:flex-row items-center gap-3">
        <!-- Search input -->
        <div class="relative w-full md:flex-1">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            [placeholder]="'search' | translate"
            class="cms-input ps-9 text-xs"
          />
          <div class="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Status Filter -->
        <select
          [(ngModel)]="selectedStatusId"
          class="cms-input w-full md:w-44 text-xs"
        >
          <option [ngValue]="null">{{ 'allStatusesFilter' | translate }}</option>
          @for (s of statuses(); track s.id) {
            <option [ngValue]="s.id">{{ s.id | translate:'status':s.name }}</option>
          }
        </select>

        <!-- Category Filter -->
        <select
          [(ngModel)]="selectedCategoryId"
          class="cms-input w-full md:w-44 text-xs"
        >
          <option [ngValue]="null">{{ 'allCategoriesFilter' | translate }}</option>
          @for (c of categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.id | translate:'category':c.name }}</option>
          }
        </select>

        <!-- Refresh Button -->
        <button
          type="button"
          (click)="loadComplaints()"
          class="cms-btn-secondary text-xs px-3 py-2 w-full md:w-auto"
          [title]="'refreshListTitle' | translate"
        >
          <svg class="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- Complaints Data Table -->
      @if (isLoading()) {
        <app-loading-skeleton [count]="5"></app-loading-skeleton>
      } @else if (filteredComplaints().length === 0) {
        <app-empty-state
          [title]="'noMatchingComplaintsTitle' | translate"
          [description]="'noMatchingComplaintsDesc' | translate"
        >
          <a
            routerLink="/complaints/new"
            class="cms-btn-primary text-xs px-4 py-2 mt-2"
          >
            {{ 'newComplaint' | translate }}
          </a>
        </app-empty-state>
      } @else {
        <div class="cms-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[680px] text-start border-collapse text-xs">
              <thead>
                <tr class="bg-[var(--bg-surface-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 text-start">#</th>
                  <th class="py-3 px-4 text-start">{{ 'complaintTitle' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'category' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'priority' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'status' | translate }}</th>
                  @if (auth.isSuperAdmin()) {
                    <th class="py-3 px-4 text-start">{{ 'complaintOwner' | translate }}</th>
                  }
                  <th class="py-3 px-4 text-start">{{ 'createdAt' | translate }}</th>
                  <th class="py-3 px-4 text-end">{{ 'actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border-subtle)] font-medium">
                @for (c of filteredComplaints(); track c.id) {
                  <tr class="hover:bg-[var(--bg-surface-secondary)]/60 transition-colors">
                    <td class="py-3 px-4 text-[var(--text-muted)] font-mono text-[11px]">#{{ c.id }}</td>
                    <td class="py-3 px-4 max-w-xs">
                      <a
                        [routerLink]="['/complaints', c.id]"
                        class="font-bold text-[var(--text-primary)] hover:text-[var(--color-brand-primary)] transition-colors block truncate"
                        [title]="c.title"
                      >
                        {{ c.title }}
                      </a>
                      <span class="text-[11px] text-[var(--text-muted)] block truncate mt-0.5">
                        {{ c.description }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-[var(--text-secondary)]">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] text-[10px] border border-[var(--border-subtle)]">
                        {{ c.categoryId | translate:'category':(c.categoryName || ('categoryGeneral' | translate)) }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span
                        class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        [ngClass]="{
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20': c.priorityId === 3 || c.priorityId === 4,
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20': c.priorityId === 2,
                          'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': c.priorityId === 1 || !c.priorityId
                        }"
                      >
                        {{ c.priorityId | translate:'priority':(c.priorityName || ('priorityNormal' | translate)) }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <app-status-badge [statusId]="c.statusId" [label]="c.statusName"></app-status-badge>
                    </td>
                    @if (auth.isSuperAdmin()) {
                      <td class="py-3 px-4 text-[var(--text-secondary)] text-[11px]">
                        {{ c.userName || (('user' | translate) + ' #' + c.userId) }}
                      </td>
                    }
                    <td class="py-3 px-4 text-[var(--text-muted)] text-[11px] font-mono">
                      {{ c.createdAt | date: 'yyyy/MM/dd HH:mm' }}
                    </td>
                    <td class="py-3 px-4 text-end">
                      <div class="inline-flex items-center gap-1.5 justify-end">
                        <a
                          [routerLink]="['/complaints', c.id]"
                          class="cms-btn-secondary px-2.5 py-1 text-[11px] rounded-lg"
                        >
                          {{ 'view' | translate }}
                        </a>
                        @if (canDelete(c)) {
                          <button
                            type="button"
                            (click)="onDeleteComplaint(c, $event)"
                            class="cms-btn-danger px-2 py-1 text-[11px] rounded-lg inline-flex items-center gap-1"
                            [title]="'deleteComplaint' | translate"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>{{ 'delete' | translate }}</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Table Footer Count -->
          <div class="px-4 py-3 bg-[var(--bg-surface-secondary)] border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>{{ 'totalDisplayedComplaints' | translate }}: {{ filteredComplaints().length }}</span>
            <span class="text-[11px]">{{ 'realtimeUpdated' | translate }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class ComplaintListComponent implements OnInit {
  private complaintsService = inject(ComplaintsService);
  private categoriesService = inject(CategoriesService);
  private statusesService = inject(StatusesService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  translation = inject(TranslationService);

  complaints = signal<ComplaintDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  statuses = signal<StatusDto[]>([]);
  isLoading = signal(true);

  searchQuery = '';
  selectedStatusId: number | null = null;
  selectedCategoryId: number | null = null;

  filteredComplaints = computed(() => {
    let list = this.complaints();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.userName?.toLowerCase().includes(q) ||
          c.id.toString() === q
      );
    }

    if (this.selectedStatusId !== null) {
      list = list.filter((c) => c.statusId === this.selectedStatusId);
    }

    if (this.selectedCategoryId !== null) {
      list = list.filter((c) => c.categoryId === this.selectedCategoryId);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadMetadata();
    this.loadComplaints();
  }

  loadMetadata(): void {
    this.categoriesService.getAll().subscribe({
      next: (res) => this.categories.set(res),
      error: () => {}
    });

    this.statusesService.getAll().subscribe({
      next: (res) => this.statuses.set(res),
      error: () => {}
    });
  }

  loadComplaints(): void {
    this.isLoading.set(true);
    const user = this.auth.currentUser();

    if (this.auth.isSuperAdmin()) {
      // SuperAdmin has access to All
      this.complaintsService.getAll().subscribe({
        next: (res) => {
          this.complaints.set(res || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else if (user?.id) {
      // User has access to own complaints
      this.complaintsService.getByUserId(user.id).subscribe({
        next: (res) => {
          this.complaints.set(res || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
  }

  canDelete(c: ComplaintDto): boolean {
    if (this.auth.isStaff()) {
      return true;
    }
    const currentUserId = this.auth.currentUser()?.id;
    const isNew = c.statusId === 1 || c.statusName === 'جديدة' || c.statusName === 'New';
    return !!currentUserId && c.userId === currentUserId && isNew;
  }

  async onDeleteComplaint(c: ComplaintDto, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = await this.modal.confirm({
      title: this.translation.translate('deleteComplaintTitle'),
      message: this.translation.translate('deleteComplaintConfirmMsg'),
      highlightText: `#${c.id} - ${c.title}`,
      confirmText: this.translation.translate('confirmDeleteBtn'),
      cancelText: this.translation.translate('cancelActionBtn'),
      type: 'danger',
      isDanger: true
    });

    if (!confirmed) return;

    this.complaintsService.delete(c.id).subscribe({
      next: () => {
        this.toast.success(this.translation.translate('deleteComplaintSuccess'));
        this.complaints.update((list) => list.filter((item) => item.id !== c.id));
      },
      error: (err) => {
        this.toast.error(err.error?.message || this.translation.translate('deleteComplaintError'));
      }
    });
  }
}

