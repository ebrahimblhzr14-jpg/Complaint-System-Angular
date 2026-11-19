import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex transition-colors duration-200">
      <!-- Left/Side A: Clean Minimalist Brand Panel (Desktop only - Warm Gold Glass) -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-[var(--bg-surface)] backdrop-blur-xl p-12 flex-col justify-between border-e border-[var(--border-subtle)] shadow-xs">
        <!-- Top Brand Header -->
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
            <span class="text-xs text-[var(--text-muted)] font-medium">Complaint Management System</span>
          </div>
        </div>

        <!-- Middle Hero Content (Spacious, Minimalist) -->
        <div class="max-w-md space-y-5 my-auto">
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--color-brand-primary-subtle)] text-xs font-semibold text-[var(--color-brand-primary)] border border-[var(--border-subtle)]">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] shadow-xs shadow-[var(--color-brand-primary)]"></span>
            {{ 'heroLoginTitle' | translate }}
          </div>
          <h2 class="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] leading-snug">
            {{ 'heroLoginSubtitle' | translate }}
          </h2>
          <p class="text-[var(--text-secondary)] text-xs leading-relaxed">
            {{ 'heroLoginDesc' | translate }}
          </p>

          <!-- Clean Metrics preview cards -->
          <div class="grid grid-cols-2 gap-3 pt-3">
            <div class="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/50 backdrop-blur-md shadow-xs">
              <span class="text-xl font-bold text-[var(--text-primary)]">99.8%</span>
              <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">{{ 'slaCommitmentRate' | translate }}</p>
            </div>
            <div class="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/50 backdrop-blur-md shadow-xs">
              <span class="text-xl font-bold text-[var(--color-brand-primary)]">&lt; 24h</span>
              <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">{{ 'avgResolutionTime' | translate }}</p>
            </div>
          </div>
        </div>

        <!-- Bottom Notice -->
        <div class="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
          <span>{{ 'dataSecurityFeature' | translate }}</span>
          <span>Role-Based Access Control</span>
        </div>
      </div>

      <!-- Right/Side B: Clean Modern Auth Form (Warm Gold Glass) -->
      <div class="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
        <!-- Top Controls: Theme Switcher & Language Switcher -->
        <div class="flex items-center justify-end gap-2">
          <!-- Theme Switcher -->
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

          <!-- Language Switcher -->
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
          <!-- Centered Official Shakowa Brand Logo directly above Login Form -->
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
            <p class="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">Complaint Management System</p>
          </div>

          <div class="mb-6 text-center">
            <h3 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {{ 'login' | translate }}
            </h3>
            <p class="text-xs text-[var(--text-secondary)] mt-1">
              {{ 'signInDesc' | translate }}
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

          <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="off" class="space-y-4">
            <!-- Email Field -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                {{ 'email' | translate }}
              </label>
              <input
                #emailInput
                type="email"
                formControlName="email"
                autocomplete="off"
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

            <!-- Password Field -->
            <div>
              <label class="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                {{ 'password' | translate }}
              </label>
              <div class="relative">
                <input
                  #passwordInput
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="new-password"
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
                <span>{{ 'login' | translate }}</span>
              }
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-6 text-center text-xs text-[var(--text-secondary)]">
            <span>{{ 'dontHaveAccount' | translate }} </span>
            <a routerLink="/auth/register" class="font-semibold text-[var(--color-brand-primary)] hover:underline ms-1">
              {{ 'register' | translate }}
            </a>
          </div>
        </div>

        <!-- Footer Notice -->
        <div class="text-center text-[11px] text-[var(--text-muted)]">
          {{ 'footerText' | translate }} &copy; {{ currentYear }} — Enterprise CMS
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  translation = inject(TranslationService);
  themeService = inject(ThemeService);

  @ViewChild('emailInput') emailInput?: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput?: ElementRef<HTMLInputElement>;

  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  currentYear = new Date().getFullYear();

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // Ensure form state is completely reset upon loading the login page
    this.resetFormState();
    this.errorMessage.set(null);
  }

  ngAfterViewInit(): void {
    // Ensure native DOM input fields are clean on view initialization
    this.clearNativeInputs();
    // Guard against delayed browser-level autofill on page mount
    setTimeout(() => {
      if (this.form.pristine) {
        this.clearNativeInputs();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    // Wipe sensitive form credentials from component state upon leaving
    this.resetFormState();
    this.clearNativeInputs();
  }

  private resetFormState(): void {
    this.form.reset({
      email: '',
      password: ''
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private clearNativeInputs(): void {
    if (this.emailInput?.nativeElement && this.form.pristine) {
      this.emailInput.nativeElement.value = '';
    }
    if (this.passwordInput?.nativeElement && this.form.pristine) {
      this.passwordInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const credentials = {
      email: this.form.value.email?.trim(),
      password: this.form.value.password
    };

    this.auth.login(credentials).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Requirement 1 & 6: Clear password and form immediately upon successful login
        this.resetFormState();
        this.clearNativeInputs();
        const role = this.auth.currentUser()?.role;
        // Use replaceUrl: true to prevent browser history back-cache from restoring filled login form
        if (role === 'SuperAdmin' || role === 'Admin') {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/complaints'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Requirement 5: On failed login, preserve username/email but wipe password immediately
        const currentEmail = this.form.get('email')?.value;
        this.form.get('password')?.reset('');
        this.form.get('password')?.markAsPristine();
        this.form.get('password')?.markAsUntouched();
        if (this.passwordInput?.nativeElement) {
          this.passwordInput.nativeElement.value = '';
        }
        if (currentEmail) {
          this.form.get('email')?.setValue(currentEmail);
          if (this.emailInput?.nativeElement) {
            this.emailInput.nativeElement.value = currentEmail;
          }
        }

        const isAr = this.translation.currentLang() === 'ar';
        if (err.status === 401) {
          this.errorMessage.set(
            isAr
              ? 'بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.'
              : 'Invalid credentials. Please verify your email and password.'
          );
        } else if (err.status === 429) {
          this.errorMessage.set(
            isAr
              ? 'تم تجاوز حد محاولات تسجيل الدخول. يرجى الانتظار دقيقتين والمحاولة مجدداً.'
              : 'Login rate limit exceeded. Please wait 2 minutes before retrying.'
          );
        } else if (err.status === 0) {
          this.errorMessage.set(
            isAr
              ? 'تعذر الاتصال بالخادم (Backend). يرجى التأكد من تشغيل الباك إند على https://localhost:7043.'
              : 'Unable to connect to the backend server. Please verify backend is running on https://localhost:7043.'
          );
        } else if (err.status >= 500) {
          this.errorMessage.set(
            isAr
              ? 'تعذر الاتصال بقاعدة البيانات أو الخادم الداخلي (500). يرجى التأكد من تشغيل SQL Server.'
              : 'Database connection or internal server error (500). Please verify database services.'
          );
        } else {
          this.errorMessage.set(
            err.error?.message ||
            (isAr ? 'تعذر تسجيل الدخول. يرجى إعادة المحاولة.' : 'Login failed. Please try again.')
          );
        }
      }
    });
  }
}
