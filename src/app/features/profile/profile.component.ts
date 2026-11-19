import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
          {{ 'profile' | translate }}
        </h1>
        <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          {{ 'profileSubtitle' | translate }}
        </p>
      </div>

      <!-- Account Info Card -->
      @if (auth.currentUser(); as user) {
        <div class="cms-card p-6 bg-[var(--bg-surface)] text-[var(--text-primary)] space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)] text-white flex items-center justify-center font-bold text-lg">
              {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div>
              <h2 class="text-base font-bold text-[var(--text-primary)]">{{ user.name }}</h2>
              <p class="text-xs text-[var(--text-secondary)]">{{ user.email }}</p>
              <div class="mt-1 flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-brand-primary-subtle)] text-[var(--color-brand-primary)]">
                  {{ user.role | translate:'role' }}
                </span>
                <span class="text-[10px] text-[var(--text-muted)] font-mono">
                  {{ 'accountIdPrefix' | translate }}: #{{ user.id }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Change Password Card -->
      <div class="cms-card p-6 bg-[var(--bg-surface)] text-[var(--text-primary)] space-y-4">
        <h3 class="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <svg class="w-4 h-4 text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {{ 'changePassword' | translate }}
        </h3>

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
              {{ 'currentPassword' | translate }} *
            </label>
            <input
              type="password"
              formControlName="currentPassword"
              placeholder="••••••••"
              class="cms-input text-xs"
              [ngClass]="{ 'cms-input-error': passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.invalid }"
            />
            @if (passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.errors?.['required']) {
              <p class="text-rose-600 text-[11px] mt-1">{{ 'currentPasswordRequiredMsg' | translate }}</p>
            }
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
              {{ 'newPassword' | translate }} ({{ 'passwordMinLength' | translate }}) *
            </label>
            <input
              type="password"
              formControlName="newPassword"
              placeholder="••••••••"
              class="cms-input text-xs"
              [ngClass]="{ 'cms-input-error': passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid }"
            />
            @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.errors?.['minlength']) {
              <p class="text-rose-600 text-[11px] mt-1">{{ 'passwordRequirementsMsg' | translate }}</p>
            }
          </div>

          <div class="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="submit"
              [disabled]="passwordForm.invalid || isChangingPassword()"
              class="cms-btn-primary px-5 py-2.5 text-xs font-bold"
            >
              @if (isChangingPassword()) {
                <span>{{ 'loading' | translate }}</span>
              } @else {
                <span>{{ 'save' | translate }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  translation = inject(TranslationService);
  auth = inject(AuthService);

  isChangingPassword = signal(false);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword()) return;

    this.isChangingPassword.set(true);
    this.usersService.changeMyPassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordForm.reset();
        const isAr = this.translation.currentLang() === 'ar';
        this.toast.success(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      },
      error: (err: any) => {
        this.isChangingPassword.set(false);
        const isAr = this.translation.currentLang() === 'ar';
        this.toast.error(err.error?.message || (isAr ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect'));
      }
    });
  }
}

