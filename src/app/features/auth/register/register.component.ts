import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { RegisterRequest } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex transition-colors duration-200">
      <!-- Left/Side A: Clean Minimalist Brand Panel (Desktop only - Warm Gold Glass) -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-[var(--bg-surface)] backdrop-blur-xl p-12 flex-col justify-between border-e border-[var(--border-subtle)] shadow-xs">
        <!-- Brand Header -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-[var(--bg-surface-secondary)]/90 backdrop-blur-md border border-[var(--border-subtle)] p-2 flex items-center justify-center shrink-0 shadow-xs">
            <img
              src="assets/brand/shakowa-logo.svg"
              alt="Shakowa Logo"
              class="w-full h-full object-contain"
            />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-base font-extrabold text-[var(--text-primary)] tracking-tight">{{ 'brandName' | translate }}</span>
              <span class="text-xs text-[var(--color-brand-primary)] font-bold">| {{ 'appName' | translate }}</span>
            </div>
            <span class="text-xs text-[var(--text-muted)] font-medium">{{ 'registerPortalBadge' | translate }}</span>
          </div>
        </div>

        <!-- Middle Hero Content (Spacious, Minimalist) -->
        <div class="max-w-md space-y-5 my-auto">
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--color-brand-primary-subtle)] text-xs font-semibold text-[var(--color-brand-primary)] border border-[var(--border-subtle)]">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] shadow-xs shadow-[var(--color-brand-primary)]"></span>
            {{ 'heroRegisterTitle' | translate }}
          </div>
          <h2 class="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] leading-snug">
            {{ 'heroRegisterSubtitle' | translate }}
          </h2>
          <p class="text-[var(--text-secondary)] text-xs leading-relaxed">
            {{ 'heroRegisterDesc' | translate }}
          </p>

          <div class="space-y-2.5 pt-2">
            <div class="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              <span class="text-[var(--color-success)] font-bold">✓</span>
              <span>{{ 'registerFeatureRealtime' | translate }}</span>
            </div>
            <div class="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              <span class="text-[var(--color-success)] font-bold">✓</span>
              <span>{{ 'registerFeatureDirectComm' | translate }}</span>
            </div>
            <div class="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              <span class="text-[var(--color-success)] font-bold">✓</span>
              <span>{{ 'registerFeatureEvaluation' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
          <span>{{ 'dataSecurityFeature' | translate }}</span>
          <span>SSL / TLS Encrypted</span>
        </div>
      </div>

      <!-- Right/Side B: Registration Form (Warm Gold Glass) -->
      <div class="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
        <!-- Top Controls: Theme Switcher & Language Switcher -->
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            (click)="themeService.toggleTheme()"
            class="flex items-center justify-center w-8.5 h-8.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--color-brand-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs"
            [title]="themeService.currentTheme() === 'dark' ? ('themeLight' | translate) : ('themeDark' | translate)"
          >
            @if (themeService.currentTheme() === 'dark') {
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <svg class="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

          <button
            type="button"
            (click)="translation.toggleLanguage()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs"
          >
            <span>{{ translation.currentLang() === 'ar' ? 'English' : 'العربية' }}</span>
          </button>
        </div>

        <!-- Form Container -->
        <div class="w-full max-w-sm mx-auto my-auto py-8">
          <!-- Centered Official Shakowa Brand Logo directly above Register Form -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--border-subtle)] p-3 sm:p-3.5 flex items-center justify-center shadow-md shadow-black/5 hover:border-[var(--color-brand-primary)]/40 transition-all duration-300 group">
              <img
                src="assets/brand/shakowa-logo.svg"
                alt="شعار تطبيق شكوى - Shakowa Logo"
                class="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
                loading="eager"
              />
            </div>
            <div class="mt-3 flex items-center justify-center gap-1.5">
              <span class="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight">{{ 'brandName' | translate }}</span>
              <span class="text-xs text-[var(--color-brand-primary)] font-bold">| {{ 'appName' | translate }}</span>
            </div>
            <p class="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">{{ 'registerPortalBadge' | translate }}</p>
          </div>

          <div class="mb-5 text-center">
            <h3 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {{ 'register' | translate }}
            </h3>
            <p class="text-xs text-[var(--text-secondary)] mt-1">
              {{ 'signUpDesc' | translate }}
            </p>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="mb-5 p-3 rounded-lg bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-xs flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-3.5">
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                {{ 'fullName' | translate }} *
              </label>
              <input
                type="text"
                formControlName="name"
                [placeholder]="'namePlaceholder' | translate"
                class="cms-input"
                [ngClass]="{ 'cms-input-error': form.get('name')?.touched && form.get('name')?.invalid }"
              />
              @if (form.get('name')?.touched && form.get('name')?.errors?.['required']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'nameRequired' | translate }}</p>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                {{ 'email' | translate }} *
              </label>
              <input
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                class="cms-input"
                [ngClass]="{ 'cms-input-error': form.get('email')?.touched && form.get('email')?.invalid }"
              />
              @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'emailRequired' | translate }}</p>
              }
              @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'emailInvalid' | translate }}</p>
              }
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                {{ 'phone' | translate }} ({{ 'optional' | translate }})
              </label>
              <input
                type="tel"
                formControlName="phone"
                [placeholder]="'phonePlaceholder' | translate"
                class="cms-input"
                [ngClass]="{ 'cms-input-error': form.get('phone')?.touched && form.get('phone')?.invalid }"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                {{ 'password' | translate }} ({{ 'passwordMinLength' | translate }}) *
              </label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="cms-input pe-9"
                  [ngClass]="{ 'cms-input-error': form.get('password')?.touched && form.get('password')?.invalid }"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 end-0 pe-2.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  [title]="showPassword() ? ('hidePassword' | translate) : ('showPassword' | translate)"
                >
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'passwordMinLengthWarning' | translate }}</p>
              }
              @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
                <p class="text-[var(--color-danger)] text-[11px] mt-1 font-medium">{{ 'passwordRequired' | translate }}</p>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="form.invalid || isSubmitting()"
              class="cms-btn-primary w-full py-2.5 text-xs font-semibold rounded-lg cursor-pointer mt-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin -ms-1 me-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ 'loading' | translate }}</span>
              } @else {
                <span>{{ 'register' | translate }}</span>
              }
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-5 text-center text-xs text-[var(--text-secondary)]">
            <span>{{ 'alreadyHaveAccount' | translate }} </span>
            <a routerLink="/auth/login" class="font-semibold text-[var(--color-brand-primary)] hover:underline ms-1">
              {{ 'login' | translate }}
            </a>
          </div>
        </div>

        <div class="text-center text-[11px] text-[var(--text-muted)]">
          {{ 'footerText' | translate }} &copy; {{ currentYear }} — Enterprise CMS
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  translation = inject(TranslationService);
  themeService = inject(ThemeService);

  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  currentYear = new Date().getFullYear();

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [Validators.maxLength(20)]]
  });

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.form.value;
    const payload: RegisterRequest = {
      name: val.name?.trim(),
      email: val.email?.trim()?.toLowerCase(),
      password: val.password,
      phone: val.phone?.trim() ? val.phone.trim() : null
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/complaints']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        const isAr = this.translation.currentLang() === 'ar';

        if (err.status === 0) {
          this.errorMessage.set(
            isAr
              ? 'تعذر الاتصال بخادم النظام (Backend). يرجى التأكد من تشغيل الباك إند على https://localhost:7043.'
              : 'Cannot connect to backend server. Please verify backend is running on https://localhost:7043.'
          );
        } else if (err.status === 409) {
          const rawMsg = err.error?.message || '';
          const isDbError =
            rawMsg.includes('transient failure') ||
            rawMsg.includes('UseSqlServer') ||
            rawMsg.includes('Cannot open database') ||
            rawMsg.includes('SqlException');

          if (isDbError) {
            this.errorMessage.set(
              isAr
                ? 'تعذر الاتصال بقاعدة البيانات ComplaintManagementDB في SQL Server. يرجى إنشاء قاعدة البيانات وتشغيل سكريبت ComplaintsDB_Schema.sql.'
                : 'Could not connect to ComplaintManagementDB in SQL Server. Please create the database and run ComplaintsDB_Schema.sql.'
            );
          } else {
            this.errorMessage.set(
              rawMsg ||
              (isAr
                ? 'البريد الإلكتروني مسجل مسبقاً في النظام. يرجى استخدام بريد آخر أو تسجيل الدخول.'
                : 'This email is already registered. Please use another email or log in.')
            );
          }
        } else if (err.status === 429) {
          this.errorMessage.set(
            isAr
              ? 'تم تجاوز الحد الأقصى المسموح لإنشاء الحسابات (طلب واحد كل 15 دقيقة لكل IP). يرجى المحاولة لاحقاً.'
              : 'Registration rate limit exceeded (1 request per 15 minutes). Please try again later.'
          );
        } else if (err.status === 400) {
          const validationMsg =
            err.error?.message ||
            err.error?.title ||
            (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : null);
          this.errorMessage.set(
            validationMsg ||
            (isAr
              ? 'بيانات التسجيل غير صالحة. تأكد من استيفاء جميع الحقول المطلوبة وكلمة المرور (8 خانات على الأقل).'
              : 'Invalid registration data. Please verify all required fields and password length.')
          );
        } else if (err.status >= 500) {
          const rawMsg = (typeof err.error === 'string' ? err.error : (err.error?.message || '')) || '';
          const isDbError =
            rawMsg.includes('transient failure') ||
            rawMsg.includes('UseSqlServer') ||
            rawMsg.includes('Cannot open database') ||
            rawMsg.includes('SqlException');

          if (isDbError) {
            this.errorMessage.set(
              isAr
                ? 'تعذر الاتصال بقاعدة البيانات في خادم SQL Server. يرجى التأكد من تشغيل خادم قاعدة البيانات ومحاولة التسجيل لاحقاً.'
                : 'Could not connect to the database in SQL Server. Please make sure the SQL Server service is running and try again.'
            );
          } else {
            this.errorMessage.set(
              isAr
                ? 'حدث خطأ داخلي في الخادم أو قاعدة البيانات (500). يرجى المحاولة لاحقاً.'
                : 'Internal server or database error (500). Please try again later.'
            );
          }
        } else {
          this.errorMessage.set(
            err.error?.message ||
            (isAr
              ? 'حدث خطأ غير متوقع أثناء التسجيل. يرجى إعادة المحاولة.'
              : 'An unexpected error occurred during registration. Please try again.')
          );
        }
      }
    });
  }
}
