import { Component, OnInit, OnDestroy, inject, signal, effect, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { catchError, exhaustMap, finalize } from 'rxjs/operators';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import {
  ComplaintSummaryDto,
  ComplaintsByStatusDto,
  ComplaintsByPriorityDto,
  ComplaintsByCategoryDto
} from '../../core/models';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective,
    LoadingSkeletonComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {{ 'dashboard' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {{ 'dashboardSubtitle' | translate }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (auth.isStaff()) {
            <button
              type="button"
              (click)="loadDashboardData(true)"
              class="cms-btn-secondary text-xs px-3.5 py-2"
              [disabled]="isLoading() || cooldownSeconds() > 0"
              [title]="cooldownSeconds() > 0 ? ('cooldownWaitTitle' | translate) : ('refreshDataTitle' | translate)"
            >
              <svg class="w-4 h-4 text-[var(--text-muted)]" [class.animate-spin]="isLoading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              @if (cooldownSeconds() > 0) {
                <span>{{ 'refresh' | translate }} ({{ cooldownSeconds() }}s)</span>
              } @else {
                <span>{{ 'refresh' | translate }}</span>
              }
            </button>
          }

          <a
            routerLink="/complaints/new"
            class="cms-btn-primary text-xs px-3.5 py-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ 'newComplaint' | translate }}</span>
          </a>
        </div>
      </div>

      <!-- Unauthorized State -->
      @if (!auth.isStaff()) {
        <div class="cms-card p-8 sm:p-12 text-center">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-base font-bold text-[var(--text-primary)]">{{ 'dashboardUnauthorizedTitle' | translate }}</h2>
          <p class="text-xs text-[var(--text-secondary)] mt-1.5 max-w-md mx-auto">
            {{ 'dashboardUnauthorizedDesc' | translate }}
          </p>
          <div class="mt-5">
            <a routerLink="/complaints" class="cms-btn-primary text-xs px-4 py-2 inline-flex items-center gap-2">
              <span>{{ 'goToComplaints' | translate }}</span>
            </a>
          </div>
        </div>
      } @else {
        <!-- Partial Backend Error Banner (HTTP 500 / 429) -->
        @if (hasBackendErrors()) {
          <div class="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--text-primary)]">
            <div class="flex items-start sm:items-center gap-2.5">
              <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                @if (is429()) {
                  <p class="font-bold text-amber-700 dark:text-amber-400">{{ 'dashboardRateLimitWarnTitle' | translate }}</p>
                  <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {{ 'dashboardRateLimitWaitDesc' | translate }} ({{ cooldownSeconds() }}s)
                  </p>
                } @else {
                  <p class="font-bold text-amber-700 dark:text-amber-400">{{ 'dashboardPartialLoadWarnTitle' | translate }}</p>
                  <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {{ 'dashboardPartialLoadDesc' | translate }}
                  </p>
                }
              </div>
            </div>
            <button
              type="button"
              (click)="loadDashboardData(true)"
              [disabled]="isLoading() || cooldownSeconds() > 0"
              class="cms-btn-secondary text-[11px] px-3 py-1.5 shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              @if (cooldownSeconds() > 0) {
                <span>{{ 'retry' | translate }} ({{ cooldownSeconds() }}s)</span>
              } @else {
                <span>{{ 'retry' | translate }}</span>
              }
            </button>
          </div>
        }

        <!-- Loading State -->
        @if (isLoading()) {
          <app-loading-skeleton [count]="3"></app-loading-skeleton>
        } @else {
          <!-- KPI Summary Cards -->
          @if (summary(); as stats) {
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <!-- Total -->
              <div class="cms-card p-4 sm:p-5 border-s-4 border-s-[var(--color-brand-primary)]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[var(--text-secondary)]">{{ 'totalComplaintsCount' | translate }}</span>
                  <div class="w-8 h-8 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-black text-[var(--text-primary)] mt-2">{{ stats.totalComplaints }}</p>
              </div>

              <!-- Pending -->
              <div class="cms-card p-4 sm:p-5 border-s-4 border-s-[#879477]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[var(--text-secondary)]">{{ 'pendingCount' | translate }}</span>
                  <div class="w-8 h-8 rounded-xl bg-[#879477]/15 text-[#879477] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-black text-[#879477] mt-2">{{ stats.pendingComplaints }}</p>
              </div>

              <!-- In Progress -->
              <div class="cms-card p-4 sm:p-5 border-s-4 border-s-[#C58A3A]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[var(--text-secondary)]">{{ 'inProgressCount' | translate }}</span>
                  <div class="w-8 h-8 rounded-xl bg-[#C58A3A]/15 text-[#C58A3A] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-black text-[#C58A3A] mt-2">{{ stats.inProgressComplaints }}</p>
              </div>

              <!-- Resolved -->
              <div class="cms-card p-4 sm:p-5 border-s-4 border-s-[#54856A]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[var(--text-secondary)]">{{ 'resolvedCount' | translate }}</span>
                  <div class="w-8 h-8 rounded-xl bg-[#54856A]/15 text-[#54856A] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-black text-[#54856A] mt-2">{{ stats.resolvedComplaints }}</p>
              </div>

              <!-- Closed -->
              <div class="cms-card p-4 sm:p-5 border-s-4 border-s-[#817C72]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[var(--text-secondary)]">{{ 'closedCount' | translate }}</span>
                  <div class="w-8 h-8 rounded-xl bg-[#817C72]/15 text-[#817C72] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-black text-[#817C72] mt-2">{{ stats.closedComplaints }}</p>
              </div>

              <!-- Rejected -->
              <div class="cms-card p-4 sm:p-5 border-s-4 border-s-[#B85C55]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[var(--text-secondary)]">{{ 'rejectedCount' | translate }}</span>
                  <div class="w-8 h-8 rounded-xl bg-[#B85C55]/15 text-[#B85C55] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-black text-[#B85C55] mt-2">{{ stats.rejectedComplaints }}</p>
              </div>
            </div>
          }

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Complaints by Status Chart -->
            <div class="cms-card p-5 sm:p-6 w-full max-w-full min-w-0 overflow-hidden">
              <h2 class="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-accent)]"></span>
                {{ 'statusDistribution' | translate }}
              </h2>
              @if (statusChartData.labels && statusChartData.labels.length > 0) {
                <div class="h-64 flex items-center justify-center w-full max-w-full min-w-0 overflow-hidden">
                  <canvas
                    baseChart
                    [data]="statusChartData"
                    [type]="'doughnut'"
                    [options]="doughnutChartOptions"
                  ></canvas>
                </div>
              } @else {
                <div class="py-12 text-center text-xs text-[var(--text-muted)]">
                  {{ 'noChartData' | translate }}
                </div>
              }
            </div>

            <!-- Complaints by Priority Chart -->
            <div class="cms-card p-5 sm:p-6 w-full max-w-full min-w-0 overflow-hidden">
              <h2 class="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)]"></span>
                {{ 'priorityDistribution' | translate }}
              </h2>
              @if (priorityChartData.labels && priorityChartData.labels.length > 0) {
                <div class="h-64 flex items-center justify-center w-full max-w-full min-w-0 overflow-hidden">
                  <canvas
                    baseChart
                    [data]="priorityChartData"
                    [type]="'bar'"
                    [options]="barChartOptions"
                  ></canvas>
                </div>
              } @else {
                <div class="py-12 text-center text-xs text-[var(--text-muted)]">
                  {{ 'noChartData' | translate }}
                </div>
              }
            </div>

            <!-- Complaints by Category Chart (Full width) -->
            <div class="cms-card p-5 sm:p-6 lg:col-span-2 w-full max-w-full min-w-0 overflow-hidden">
              <h2 class="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                {{ 'categoryDistribution' | translate }}
              </h2>
              @if (categoryChartData.labels && categoryChartData.labels.length > 0) {
                <div class="h-72 w-full max-w-full min-w-0 overflow-hidden">
                  <canvas
                    baseChart
                    [data]="categoryChartData"
                    [type]="'bar'"
                    [options]="barChartOptions"
                  ></canvas>
                </div>
              } @else {
                <div class="py-12 text-center text-xs text-[var(--text-muted)]">
                  {{ 'noCategoryChartData' | translate }}
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  auth = inject(AuthService);
  translation = inject(TranslationService);
  themeService = inject(ThemeService);
  toast = inject(ToastService);

  isLoading = signal(false);
  summary = signal<ComplaintSummaryDto | null>(null);
  summaryError = signal(false);
  statusError = signal(false);
  priorityError = signal(false);
  categoryError = signal(false);
  is429 = signal(false);
  hasBackendErrors = signal(false);
  cooldownSeconds = signal(0);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;
  private refreshTrigger$ = new Subject<{ forceRefresh: boolean }>();
  private refreshSub: Subscription | null = null;

  // Status Chart Data
  statusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };

  // Priority Chart Data
  priorityChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: '', backgroundColor: '#C99745', borderRadius: 8 }]
  };

  // Category Chart Data
  categoryChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: '', backgroundColor: '#D9A65A', borderRadius: 8 }]
  };

  private lastSummary: ComplaintSummaryDto | null = null;
  private lastStatus: ComplaintsByStatusDto[] | null = null;
  private lastPriority: ComplaintsByPriorityDto[] | null = null;
  private lastCategory: ComplaintsByCategoryDto[] | null = null;

  doughnutChartOptions: ChartConfiguration['options'] = this.getDoughnutOptions();
  barChartOptions: ChartConfiguration['options'] = this.getBarOptions();

  @ViewChildren(BaseChartDirective) chartDirectives?: QueryList<BaseChartDirective>;
  private refreshNeededSub?: Subscription;

  constructor() {
    // Dynamic chart color update when theme changes
    effect(() => {
      const theme = this.themeService.currentTheme();
      this.updateChartTheme(theme);
    });

    // Dynamic chart labels update when language changes
    effect(() => {
      this.translation.currentLang();
      if (this.lastStatus || this.lastPriority || this.lastCategory) {
        this.applyDashboardData(this.lastSummary, this.lastStatus, this.lastPriority, this.lastCategory);
      }
    });
  }

  ngOnInit(): void {
    // Single-flight pipeline via exhaustMap: drops concurrent refresh triggers
    this.refreshSub = this.refreshTrigger$
      .pipe(
        exhaustMap(({ forceRefresh }) => {
          const remaining = this.dashboardService.getCooldownRemainingSeconds();
          if (forceRefresh && remaining > 0) {
            const isAr = this.translation.currentLang() === 'ar';
            this.toast.warning(
              isAr
                ? `يرجى الانتظار ${remaining} ثانية قبل إعادة تحديث لوحة المؤشرات.`
                : `Please wait ${remaining} seconds before refreshing dashboard indicators.`,
              this.translation.translate('rateLimitAlertTitle')
            );
            return of(null);
          }

          this.isLoading.set(true);
          this.summaryError.set(false);
          this.statusError.set(false);
          this.priorityError.set(false);
          this.categoryError.set(false);
          this.is429.set(false);
          this.hasBackendErrors.set(false);

          return forkJoin({
            summary: this.dashboardService.getSummary(forceRefresh).pipe(
              catchError((err: HttpErrorResponse) => {
                this.handleError(err, 'summary');
                return of(null);
              })
            ),
            status: this.dashboardService.getComplaintsByStatus(forceRefresh).pipe(
              catchError((err: HttpErrorResponse) => {
                this.handleError(err, 'status');
                return of([] as ComplaintsByStatusDto[]);
              })
            ),
            priority: this.dashboardService.getComplaintsByPriority(forceRefresh).pipe(
              catchError((err: HttpErrorResponse) => {
                this.handleError(err, 'priority');
                return of([] as ComplaintsByPriorityDto[]);
              })
            ),
            category: this.dashboardService.getComplaintsByCategory(forceRefresh).pipe(
              catchError((err: HttpErrorResponse) => {
                this.handleError(err, 'category');
                return of([] as ComplaintsByCategoryDto[]);
              })
            )
          }).pipe(
            finalize(() => {
              this.isLoading.set(false);
              const hasErr =
                this.summaryError() ||
                this.statusError() ||
                this.priorityError() ||
                this.categoryError() ||
                this.is429();
              this.hasBackendErrors.set(hasErr);
            })
          );
        })
      )
      .subscribe((results) => {
        if (!results) return;
        this.applyDashboardData(
          results.summary,
          results.status,
          results.priority,
          results.category
        );
      });

    // Check existing cooldown on startup
    const existingCooldown = this.dashboardService.getCooldownRemainingSeconds();
    if (existingCooldown > 0) {
      this.startCooldown(existingCooldown);
      this.is429.set(true);
      this.hasBackendErrors.set(true);
      this.isLoading.set(false);
      return;
    }

    if (this.auth.isStaff()) {
      this.loadDashboardData(false);
    } else {
      this.isLoading.set(false);
    }

    this.refreshNeededSub = this.dashboardService.onRefreshNeeded$.subscribe(() => {
      if (!this.isLoading() && this.cooldownSeconds() === 0) {
        this.loadDashboardData(true);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshNeededSub) {
      this.refreshNeededSub.unsubscribe();
    }
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  private startCooldown(seconds: number): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
    this.dashboardService.setCooldown(seconds);
    this.cooldownSeconds.set(seconds);

    this.cooldownTimer = setInterval(() => {
      const remaining = this.dashboardService.getCooldownRemainingSeconds();
      this.cooldownSeconds.set(remaining);
      if (remaining <= 0) {
        if (this.cooldownTimer) {
          clearInterval(this.cooldownTimer);
          this.cooldownTimer = null;
        }
        this.is429.set(false);
        const hasOtherErrors =
          this.summaryError() ||
          this.statusError() ||
          this.priorityError() ||
          this.categoryError();
        this.hasBackendErrors.set(hasOtherErrors);
      }
    }, 1000);
  }

  private handleError(err: HttpErrorResponse, source: string): void {
    if (err.status === 429) {
      this.is429.set(true);
      const headerVal = err.headers?.get('Retry-After');
      const seconds = headerVal ? parseInt(headerVal, 10) : 10;
      const cooldown = isNaN(seconds) || seconds <= 0 ? 10 : seconds;
      this.startCooldown(cooldown);
    } else {
      if (source === 'summary') this.summaryError.set(true);
      if (source === 'status') this.statusError.set(true);
      if (source === 'priority') this.priorityError.set(true);
      if (source === 'category') this.categoryError.set(true);
    }
  }

  loadDashboardData(forceRefresh = false): void {
    if (!this.auth.isStaff()) {
      this.isLoading.set(false);
      return;
    }

    // Ignore if already loading (single-flight guard)
    if (this.isLoading()) {
      return;
    }

    // Ignore if rate limit cooldown is active
    if (this.cooldownSeconds() > 0) {
      if (forceRefresh) {
        const isAr = this.translation.currentLang() === 'ar';
        this.toast.warning(
          isAr
            ? `يرجى الانتظار ${this.cooldownSeconds()} ثانية قبل إعادة التحديث.`
            : `Please wait ${this.cooldownSeconds()} seconds before refreshing.`,
          this.translation.translate('rateLimitAlertTitle')
        );
      }
      this.isLoading.set(false);
      return;
    }

    this.refreshTrigger$.next({ forceRefresh });
  }

  private applyDashboardData(
    summary: ComplaintSummaryDto | null,
    status: ComplaintsByStatusDto[] | null,
    priority: ComplaintsByPriorityDto[] | null,
    category: ComplaintsByCategoryDto[] | null
  ): void {
    this.lastSummary = summary;
    this.lastStatus = status;
    this.lastPriority = priority;
    this.lastCategory = category;

    const complaintsCountLabel = this.translation.translate('complaintsCountLabel');

    if (summary) {
      this.summary.set(summary);
    } else {
      // Fallback zero stats so layout remains intact
      this.summary.set({
        totalComplaints: 0,
        pendingComplaints: 0,
        inProgressComplaints: 0,
        resolvedComplaints: 0,
        closedComplaints: 0,
        rejectedComplaints: 0
      });
    }

    const isDark = this.themeService.currentTheme() === 'dark';

    if (status && status.length > 0) {
      this.statusChartData = {
        labels: status.map((item) => this.translation.translateStatus(item.id, item.name)),
        datasets: [
          {
            data: status.map((item) => item.complaintCount),
            backgroundColor: status.map((item) => this.getStatusColor(item, isDark)),
            hoverBackgroundColor: status.map((item) => this.getStatusHoverColor(item, isDark)),
            borderColor: isDark ? 'rgba(43, 40, 34, 0.9)' : '#FFFFFF',
            borderWidth: 2,
            hoverBorderColor: isDark ? '#D9A65A' : '#C99745'
          }
        ]
      };
    } else {
      this.statusChartData = {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      };
    }
    if (priority && priority.length > 0) {
      this.priorityChartData = {
        labels: priority.map((item) => this.translation.translatePriority(item.id, item.name)),
        datasets: [
          {
            data: priority.map((item) => item.complaintCount),
            label: complaintsCountLabel,
            backgroundColor: isDark ? '#D9A65A' : '#C99745',
            borderRadius: 8
          }
        ]
      };
    } else {
      this.priorityChartData = {
        labels: [],
        datasets: [{ data: [], label: complaintsCountLabel, backgroundColor: isDark ? '#D9A65A' : '#C99745', borderRadius: 8 }]
      };
    }

    if (category && category.length > 0) {
      this.categoryChartData = {
        labels: category.map((item) => this.translation.translateCategory(item.id, item.name)),
        datasets: [
          {
            data: category.map((item) => item.complaintCount),
            label: complaintsCountLabel,
            backgroundColor: isDark ? '#E98A2D' : '#A9792E',
            borderRadius: 8
          }
        ]
      };
    } else {
      this.categoryChartData = {
        labels: [],
        datasets: [{ data: [], label: complaintsCountLabel, backgroundColor: isDark ? '#E98A2D' : '#A9792E', borderRadius: 8 }]
      };
    }

    setTimeout(() => {
      this.chartDirectives?.forEach((c) => c.update());
    }, 0);
  }

  /**
   * Determine whether a status represents "Rejected" (المرفوضة).
   * Bound semantically to StatusId: 4 or status name, independent of array ordering.
   */
  isRejectedStatus(id?: number, name?: string): boolean {
    if (id === 4) return true;
    if (name) {
      const lower = name.toLowerCase();
      if (lower.includes('مرفوض') || lower.includes('رفض') || lower.includes('reject')) {
        return true;
      }
    }
    return false;
  }

  isPendingStatus(id?: number, name?: string): boolean {
    if (id === 1) return true;
    if (name) {
      const lower = name.toLowerCase();
      if (lower.includes('جديد') || lower.includes('معلق') || lower.includes('pending') || lower.includes('new')) {
        return true;
      }
    }
    return false;
  }

  isInProgressStatus(id?: number, name?: string): boolean {
    if (id === 2) return true;
    if (name) {
      const lower = name.toLowerCase();
      if (lower.includes('معالج') || lower.includes('progress')) {
        return true;
      }
    }
    return false;
  }

  isResolvedStatus(id?: number, name?: string): boolean {
    if (id === 5) return true;
    if (name) {
      const lower = name.toLowerCase();
      if (lower.includes('حل') || lower.includes('منجز') || lower.includes('resolved') || lower.includes('complete')) {
        return true;
      }
    }
    return false;
  }

  isClosedStatus(id?: number, name?: string): boolean {
    if (id === 3) return true;
    if (name) {
      const lower = name.toLowerCase();
      if (lower.includes('مغلق') || lower.includes('closed') || lower.includes('close')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Maps a status item to its semantic Warm Gold Glassmorphism palette color:
   * - جديدة (New): Earthy Olive Green #879477 (Light) / #9BAA8B (Dark)
   * - قيد المعالجة (In Progress): Warm Muted Amber #C58A3A (Light) / #D69E4F (Dark)
   * - تم الحل (Resolved): Calm Natural Sage Green #54856A (Light) / #689D80 (Dark)
   * - مغلقة (Closed): Warm Slate Gray #817C72 (Light) / #9B958A (Dark)
   * - مرفوضة (Rejected): Soft Terracotta Red #B85C55 (Light) / #C87069 (Dark)
   */
  getStatusColor(item: ComplaintsByStatusDto, isDark: boolean): string {
    if (this.isRejectedStatus(item.id, item.name)) {
      return isDark ? '#C87069' : '#B85C55';
    }
    if (this.isPendingStatus(item.id, item.name)) {
      return isDark ? '#9BAA8B' : '#879477';
    }
    if (this.isInProgressStatus(item.id, item.name)) {
      return isDark ? '#D69E4F' : '#C58A3A';
    }
    if (this.isResolvedStatus(item.id, item.name)) {
      return isDark ? '#689D80' : '#54856A';
    }
    if (this.isClosedStatus(item.id, item.name)) {
      return isDark ? '#9B958A' : '#817C72';
    }
    return isDark ? '#9B958A' : '#817C72';
  }

  /**
   * Status hover slice color with enhanced warmth and distinction.
   */
  getStatusHoverColor(item: ComplaintsByStatusDto, isDark: boolean): string {
    if (this.isRejectedStatus(item.id, item.name)) {
      return isDark ? '#B85C55' : '#A54B45';
    }
    if (this.isPendingStatus(item.id, item.name)) {
      return isDark ? '#879477' : '#778467';
    }
    if (this.isInProgressStatus(item.id, item.name)) {
      return isDark ? '#C58A3A' : '#B37A2D';
    }
    if (this.isResolvedStatus(item.id, item.name)) {
      return isDark ? '#54856A' : '#45735B';
    }
    if (this.isClosedStatus(item.id, item.name)) {
      return isDark ? '#817C72' : '#706B62';
    }
    return isDark ? '#817C72' : '#706B62';
  }

  private getDoughnutOptions(): ChartConfiguration['options'] {
    const isDark = this.themeService.currentTheme() === 'dark';
    const textColor = isDark ? '#F5F0E7' : '#34312C';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: 'Cairo, Inter, sans-serif', size: 12 },
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(54, 49, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#F5F0E7' : '#34312C',
          bodyColor: isDark ? '#C2B7A5' : '#777067',
          borderColor: isDark ? 'rgba(217, 166, 90, 0.3)' : 'rgba(201, 151, 69, 0.25)',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      }
    };
  }

  private getBarOptions(): ChartConfiguration['options'] {
    const isDark = this.themeService.currentTheme() === 'dark';
    const textColor = isDark ? '#C2B7A5' : '#777067';
    const gridColor = isDark ? 'rgba(217, 166, 90, 0.12)' : 'rgba(201, 151, 69, 0.15)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: textColor, font: { family: 'Cairo, Inter, sans-serif', size: 11 } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: textColor, font: { family: 'Cairo, Inter, sans-serif', size: 11 } },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(54, 49, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#F5F0E7' : '#34312C',
          bodyColor: isDark ? '#C2B7A5' : '#777067',
          borderColor: isDark ? 'rgba(217, 166, 90, 0.3)' : 'rgba(201, 151, 69, 0.25)',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      }
    };
  }

  private updateChartTheme(theme: 'light' | 'dark'): void {
    const isDark = theme === 'dark';
    this.doughnutChartOptions = this.getDoughnutOptions();
    this.barChartOptions = this.getBarOptions();

    const primaryColor = isDark ? '#D9A65A' : '#C99745';
    const accentColor = isDark ? '#E98A2D' : '#A9792E';

    if (this.statusChartData.datasets[0] && this.lastStatus && this.lastStatus.length > 0) {
      this.statusChartData.datasets[0].backgroundColor = this.lastStatus.map((item) =>
        this.getStatusColor(item, isDark)
      );
      this.statusChartData.datasets[0].hoverBackgroundColor = this.lastStatus.map((item) =>
        this.getStatusHoverColor(item, isDark)
      );
      this.statusChartData.datasets[0].borderColor = isDark ? 'rgba(43, 40, 34, 0.9)' : '#FFFFFF';
      this.statusChartData.datasets[0].hoverBorderColor = isDark ? '#D9A65A' : '#C99745';
    }

    if (this.priorityChartData.datasets[0]) {
      this.priorityChartData.datasets[0].backgroundColor = primaryColor;
    }
    if (this.categoryChartData.datasets[0]) {
      this.categoryChartData.datasets[0].backgroundColor = accentColor;
    }

    setTimeout(() => {
      this.chartDirectives?.forEach((c) => c.update());
    }, 0);
  }
}
