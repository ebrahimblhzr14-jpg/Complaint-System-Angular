import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import { TranslationService } from '../../../core/services/translation.service';
import { UserDto, CreateUserDto } from '../../../core/models';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
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
            {{ 'users' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {{ 'usersManagementSubtitle' | translate }}
          </p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="cms-btn-primary text-xs px-4 py-2.5 self-start sm:self-auto shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>{{ 'addUser' | translate }}</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="cms-card p-4 flex items-center gap-3">
        <div class="relative flex-1">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            [placeholder]="'searchUsersPlaceholder' | translate"
            class="cms-input ps-9 text-xs"
          />
          <div class="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          (click)="loadUsers()"
          class="cms-btn-secondary text-xs px-3 py-2"
          [title]="'refresh' | translate"
        >
          <svg class="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- Users Table -->
      @if (!auth.isSuperAdmin()) {
        <app-empty-state
          [title]="'unauthorizedUsersTitle' | translate"
          [description]="'unauthorizedUsersDesc' | translate"
        ></app-empty-state>
      } @else if (isLoading()) {
        <app-loading-skeleton [count]="5"></app-loading-skeleton>
      } @else if (errorMessage()) {
        <app-empty-state
          [title]="'failedToLoadUsersTitle' | translate"
          [description]="errorMessage()!"
        >
          <button
            type="button"
            (click)="loadUsers(true)"
            class="cms-btn-secondary text-xs px-4 py-2 mt-2"
          >
            {{ 'retry' | translate }}
          </button>
        </app-empty-state>
      } @else if (filteredUsers().length === 0) {
        <app-empty-state
          [title]="'noUsersFoundTitle' | translate"
          [description]="'noUsersFoundDesc' | translate"
        ></app-empty-state>
      } @else {
        <div class="cms-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[680px] text-start border-collapse text-xs">
              <thead>
                <tr class="bg-[var(--bg-surface-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3 px-4 text-start">#</th>
                  <th class="py-3 px-4 text-start">{{ 'fullName' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'email' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'phone' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'role' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'status' | translate }}</th>
                  <th class="py-3 px-4 text-start">{{ 'createdAt' | translate }}</th>
                  <th class="py-3 px-4 text-end">{{ 'actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border-subtle)] font-medium">
                @for (u of filteredUsers(); track u.id) {
                  <tr class="hover:bg-[var(--bg-surface-secondary)]/60 transition-colors">
                    <td class="py-3 px-4 text-[var(--text-muted)] font-mono text-[11px]">#{{ u.id }}</td>
                    <td class="py-3 px-4 font-bold text-[var(--text-primary)]">{{ u.name }}</td>
                    <td class="py-3 px-4 text-[var(--text-secondary)] font-mono text-[11px]">{{ u.email }}</td>
                    <td class="py-3 px-4 text-[var(--text-secondary)] font-mono text-[11px]">{{ u.phone || '—' }}</td>
                    <td class="py-3 px-4">
                      <span
                        class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        [ngClass]="{
                          'bg-indigo-500/10 text-[var(--color-brand-primary)] border border-indigo-500/20': u.roleId === 3,
                          'bg-sky-500/10 text-sky-500 border border-sky-500/20': u.roleId === 2,
                          'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]': u.roleId === 1
                        }"
                      >
                        {{ u.roleName || (u.roleId === 3 ? ('roleSuperAdmin' | translate) : (u.roleId === 2 ? ('roleAdmin' | translate) : ('roleCitizen' | translate))) }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="u.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'"
                      >
                        {{ (u.isActive ? 'active' : 'inactive') | translate }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-[var(--text-muted)] font-mono text-[11px]">
                      {{ u.createdAt | date: 'yyyy/MM/dd' }}
                    </td>
                    <td class="py-3 px-4 text-end">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- Toggle Active -->
                        <button
                          type="button"
                          (click)="toggleUserActive(u)"
                          class="px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer"
                          [ngClass]="u.isActive ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20' : 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'"
                          [title]="(u.isActive ? 'deactivateUser' : 'activateUser') | translate"
                        >
                          {{ (u.isActive ? 'deactivate' : 'activate') | translate }}
                        </button>

                        <!-- Reset Password -->
                        <button
                          type="button"
                          (click)="openPasswordModal(u)"
                          class="cms-btn-secondary px-2 py-1 text-[11px]"
                          [title]="'resetUserPassword' | translate"
                        >
                          {{ 'password' | translate }}
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

      <!-- Create User Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm" (click)="showCreateModal.set(false)"></div>
          <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10 space-y-4 border border-[var(--border-strong)]">
            <h3 class="text-base font-bold text-[var(--text-primary)]">{{ 'addUser' | translate }}</h3>

            <form [formGroup]="createForm" (ngSubmit)="onCreateUser()" class="space-y-3.5">
              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">{{ 'fullName' | translate }} *</label>
                <input type="text" formControlName="name" class="cms-input text-xs" />
              </div>

              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">{{ 'email' | translate }} *</label>
                <input type="email" formControlName="email" class="cms-input text-xs" />
              </div>

              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">{{ 'password' | translate }} ({{ 'passwordMinLength' | translate }}) *</label>
                <input type="password" formControlName="password" class="cms-input text-xs" />
              </div>

              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">{{ 'phone' | translate }}</label>
                <input type="tel" formControlName="phone" class="cms-input text-xs" />
              </div>

              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">{{ 'role' | translate }} *</label>
                <select formControlName="roleId" class="cms-input text-xs">
                  <option [ngValue]="1">User ({{ 'roleCitizen' | translate }})</option>
                  <option [ngValue]="2">Admin ({{ 'roleAdmin' | translate }})</option>
                  <option [ngValue]="3">SuperAdmin ({{ 'roleSuperAdmin' | translate }})</option>
                </select>
              </div>

              <div class="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button type="button" (click)="showCreateModal.set(false)" class="cms-btn-secondary text-xs px-4 py-2">
                  {{ 'cancel' | translate }}
                </button>
                <button
                  type="submit"
                  [disabled]="createForm.invalid || isCreating()"
                  class="cms-btn-primary text-xs px-5 py-2"
                >
                  {{ 'save' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Reset Password Modal -->
      @if (showPasswordModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm" (click)="showPasswordModal.set(false)"></div>
          <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10 space-y-4 border border-[var(--border-strong)]">
            <h3 class="text-base font-bold text-[var(--text-primary)]">{{ 'resetUserPassword' | translate }}</h3>
            <p class="text-xs text-[var(--text-secondary)]">
              {{ 'user' | translate }}: <span class="font-bold text-[var(--text-primary)]">{{ selectedUserForPassword?.name }}</span>
            </p>

            <div>
              <label class="block text-xs font-bold text-[var(--text-primary)] mb-1">{{ 'newPassword' | translate }} *</label>
              <input type="password" [(ngModel)]="newPasswordInput" class="cms-input text-xs" placeholder="••••••••" />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" (click)="showPasswordModal.set(false)" class="cms-btn-secondary text-xs px-4 py-2">
                {{ 'cancel' | translate }}
              </button>
              <button
                type="button"
                [disabled]="!newPasswordInput || newPasswordInput.length < 8"
                (click)="onResetPassword()"
                class="cms-btn-danger text-xs px-5 py-2"
              >
                {{ 'changePassword' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UserListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  translation = inject(TranslationService);

  users = signal<UserDto[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  searchQuery = '';

  // Modals state
  showCreateModal = signal(false);
  isCreating = signal(false);
  createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: [''],
    roleId: [1, [Validators.required]]
  });

  showPasswordModal = signal(false);
  selectedUserForPassword: UserDto | null = null;
  newPasswordInput = '';

  filteredUsers = computed(() => {
    let list = this.users();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(forceRefresh = false): void {
    if (!this.auth.isSuperAdmin()) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.usersService.getAll(forceRefresh).subscribe({
      next: (res) => {
        this.users.set(res || []);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const isAr = this.translation.currentLang() === 'ar';
        if (err.status >= 500) {
          this.errorMessage.set(isAr
            ? 'حدث خطأ داخلي في استجابة خادم المستخدمين (500). يرجى التحقق من سجلات الخادم.'
            : 'Internal server error occurred while loading users (500). Please check server logs.');
        } else if (err.status === 429) {
          this.errorMessage.set(isAr
            ? 'تم تجاوز الحد المسموح للطلبات مؤقتاً (429). يرجى الانتظار دقيقة واحدة ثم إعادة المحاولة.'
            : 'Rate limit exceeded temporarily (429). Please wait a moment before retrying.');
        } else {
          this.errorMessage.set(isAr ? 'تعذر جلب بيانات المستخدمين من الخادم.' : 'Failed to retrieve users from server.');
        }
      }
    });
  }

  openCreateModal(): void {
    this.createForm.reset({ roleId: 1 });
    this.showCreateModal.set(true);
  }

  onCreateUser(): void {
    if (this.createForm.invalid || this.isCreating()) return;

    this.isCreating.set(true);
    this.usersService.create(this.createForm.value).subscribe({
      next: (user) => {
        this.users.update((list) => [user, ...list]);
        this.showCreateModal.set(false);
        this.isCreating.set(false);
        const isAr = this.translation.currentLang() === 'ar';
        this.toast.success(isAr ? 'تمت إضافة المستخدم بنجاح' : 'User created successfully');
      },
      error: (err) => {
        this.isCreating.set(false);
        const isAr = this.translation.currentLang() === 'ar';
        this.toast.error(err.error?.message || (isAr ? 'تعذر إضافة المستخدم' : 'Failed to create user'));
      }
    });
  }

  async toggleUserActive(user: UserDto): Promise<void> {
    const isAr = this.translation.currentLang() === 'ar';
    const actionLabel = user.isActive
      ? this.translation.translate('deactivate')
      : this.translation.translate('activate');
    const confirmed = await this.modal.confirm({
      title: `${actionLabel} ${this.translation.translate('user')}`,
      message: isAr
        ? `هل أنت متأكد من رغبتك في ${actionLabel} حساب "${user.name}"؟`
        : `Are you sure you want to ${actionLabel.toLowerCase()} account "${user.name}"?`,
      isDanger: user.isActive,
      confirmText: actionLabel
    });

    if (!confirmed) return;

    const op = user.isActive
      ? this.usersService.deactivate(user.id)
      : this.usersService.activate(user.id);

    op.subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
        this.toast.success(
          isAr ? `تم ${actionLabel} الحساب بنجاح` : `Account ${actionLabel.toLowerCase()}d successfully`
        );
      },
      error: () =>
        this.toast.error(
          isAr ? `تعذر ${actionLabel} الحساب حالياً` : `Failed to ${actionLabel.toLowerCase()} account`
        )
    });
  }

  openPasswordModal(user: UserDto): void {
    this.selectedUserForPassword = user;
    this.newPasswordInput = '';
    this.showPasswordModal.set(true);
  }

  onResetPassword(): void {
    if (!this.selectedUserForPassword || !this.newPasswordInput) return;

    this.usersService
      .adminChangePassword(this.selectedUserForPassword.id, {
        newPassword: this.newPasswordInput
      })
      .subscribe({
        next: () => {
          this.showPasswordModal.set(false);
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.success(isAr ? 'تم تغيير كلمة مرور المستخدم بنجاح' : 'User password reset successfully');
        },
        error: (err) => {
          const isAr = this.translation.currentLang() === 'ar';
          this.toast.error(err.error?.message || (isAr ? 'تعذر تغيير كلمة المرور' : 'Failed to reset password'));
        }
      });
  }
}

