import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, Subject } from 'rxjs';
import { shareReplay, catchError, finalize, tap } from 'rxjs/operators';
import {
  ComplaintSummaryDto,
  ComplaintsByStatusDto,
  ComplaintsByPriorityDto,
  ComplaintsByCategoryDto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Dashboard';
  private readonly COOLDOWN_KEY = 'cms_dashboard_cooldown_until';

  // Cached observables (replay buffer)
  private summaryCache$: Observable<ComplaintSummaryDto> | null = null;
  private statusCache$: Observable<ComplaintsByStatusDto[]> | null = null;
  private priorityCache$: Observable<ComplaintsByPriorityDto[]> | null = null;
  private categoryCache$: Observable<ComplaintsByCategoryDto[]> | null = null;

  // In-flight tracking to guarantee single-flight at the service level
  private summaryInFlight$: Observable<ComplaintSummaryDto> | null = null;
  private statusInFlight$: Observable<ComplaintsByStatusDto[]> | null = null;
  private priorityInFlight$: Observable<ComplaintsByPriorityDto[]> | null = null;
  private categoryInFlight$: Observable<ComplaintsByCategoryDto[]> | null = null;

  // Last known successful data to reuse when 429 occurs
  private lastSummary: ComplaintSummaryDto | null = null;
  private lastStatus: ComplaintsByStatusDto[] | null = null;
  private lastPriority: ComplaintsByPriorityDto[] | null = null;
  private lastCategory: ComplaintsByCategoryDto[] | null = null;

  // Rate limit cooldown tracking (persisted to localStorage across page reloads)
  private rateLimitResetUntil = 0;

  // Notification stream for when data has been mutated (status changed, complaint created, etc.)
  private refreshNeeded$ = new Subject<void>();
  readonly onRefreshNeeded$ = this.refreshNeeded$.asObservable();

  getSummary(forceRefresh = false): Observable<ComplaintSummaryDto> {
    // If a request is already in-flight, reuse it (single-flight)
    if (this.summaryInFlight$) {
      return this.summaryInFlight$;
    }

    // If rate-limited, return cached stale data if available; otherwise propagate 429 so UI shows unavailable state instead of fabricated zeroes
    if (this.isRateLimited()) {
      if (this.lastSummary) {
        return of(this.lastSummary);
      }
      return throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' }));
    }

    if (!forceRefresh && this.summaryCache$) {
      return this.summaryCache$;
    }

    this.summaryInFlight$ = this.http.get<ComplaintSummaryDto>(`${this.baseUrl}/summary`).pipe(
      tap((data) => {
        this.lastSummary = data;
      }),
      catchError((err: HttpErrorResponse) => {
        this.recordRateLimitError(err);
        if (err.status !== 429) {
          this.summaryCache$ = null;
        }
        return throwError(() => err);
      }),
      finalize(() => {
        this.summaryInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.summaryCache$ = this.summaryInFlight$;
    return this.summaryCache$;
  }

  getComplaintsByStatus(forceRefresh = false): Observable<ComplaintsByStatusDto[]> {
    if (this.statusInFlight$) {
      return this.statusInFlight$;
    }

    if (this.isRateLimited()) {
      if (this.lastStatus) return of(this.lastStatus);
      return throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' }));
    }

    if (!forceRefresh && this.statusCache$) {
      return this.statusCache$;
    }

    this.statusInFlight$ = this.http.get<ComplaintsByStatusDto[]>(`${this.baseUrl}/complaints-by-status`).pipe(
      tap((data) => {
        this.lastStatus = data;
      }),
      catchError((err: HttpErrorResponse) => {
        this.recordRateLimitError(err);
        if (err.status !== 429) {
          this.statusCache$ = null;
        }
        return throwError(() => err);
      }),
      finalize(() => {
        this.statusInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.statusCache$ = this.statusInFlight$;
    return this.statusCache$;
  }

  getComplaintsByPriority(forceRefresh = false): Observable<ComplaintsByPriorityDto[]> {
    if (this.priorityInFlight$) {
      return this.priorityInFlight$;
    }

    if (this.isRateLimited()) {
      if (this.lastPriority) return of(this.lastPriority);
      return throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' }));
    }

    if (!forceRefresh && this.priorityCache$) {
      return this.priorityCache$;
    }

    this.priorityInFlight$ = this.http.get<ComplaintsByPriorityDto[]>(`${this.baseUrl}/complaints-by-priority`).pipe(
      tap((data) => {
        this.lastPriority = data;
      }),
      catchError((err: HttpErrorResponse) => {
        this.recordRateLimitError(err);
        if (err.status !== 429) {
          this.priorityCache$ = null;
        }
        return throwError(() => err);
      }),
      finalize(() => {
        this.priorityInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.priorityCache$ = this.priorityInFlight$;
    return this.priorityCache$;
  }

  getComplaintsByCategory(forceRefresh = false): Observable<ComplaintsByCategoryDto[]> {
    if (this.categoryInFlight$) {
      return this.categoryInFlight$;
    }

    if (this.isRateLimited()) {
      if (this.lastCategory) return of(this.lastCategory);
      return throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' }));
    }

    if (!forceRefresh && this.categoryCache$) {
      return this.categoryCache$;
    }

    this.categoryInFlight$ = this.http.get<ComplaintsByCategoryDto[]>(`${this.baseUrl}/complaints-by-category`).pipe(
      tap((data) => {
        this.lastCategory = data;
      }),
      catchError((err: HttpErrorResponse) => {
        this.recordRateLimitError(err);
        if (err.status !== 429) {
          this.categoryCache$ = null;
        }
        return throwError(() => err);
      }),
      finalize(() => {
        this.categoryInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.categoryCache$ = this.categoryInFlight$;
    return this.categoryCache$;
  }

  recordRateLimitError(err: HttpErrorResponse): void {
    if (err.status === 429) {
      const headerVal = err.headers?.get('Retry-After');
      const seconds = headerVal ? parseInt(headerVal, 10) : 60;
      const cooldown = isNaN(seconds) || seconds <= 0 ? 60 : seconds;
      this.setCooldown(cooldown);
    }
  }

  getCooldownRemainingSeconds(): number {
    if (this.rateLimitResetUntil === 0) {
      try {
        const stored = localStorage.getItem(this.COOLDOWN_KEY);
        if (stored) {
          this.rateLimitResetUntil = parseInt(stored, 10) || 0;
        }
      } catch {}
    }
    const remainingMs = this.rateLimitResetUntil - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  }

  isRateLimited(): boolean {
    return this.getCooldownRemainingSeconds() > 0;
  }

  setCooldown(seconds: number): void {
    const cooldownMs = Math.max(0, seconds) * 1000;
    this.rateLimitResetUntil = Date.now() + cooldownMs;
    try {
      localStorage.setItem(this.COOLDOWN_KEY, String(this.rateLimitResetUntil));
    } catch {}
  }

  clearCache(): void {
    this.summaryCache$ = null;
    this.statusCache$ = null;
    this.priorityCache$ = null;
    this.categoryCache$ = null;
    this.lastSummary = null;
    this.lastStatus = null;
    this.lastPriority = null;
    this.lastCategory = null;
    this.refreshNeeded$.next();
  }
}
