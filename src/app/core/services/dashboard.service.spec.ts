import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { ComplaintSummaryDto } from '../models';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTesting: HttpTestingController;

  const mockSummary: ComplaintSummaryDto = {
    totalComplaints: 10,
    pendingComplaints: 2,
    inProgressComplaints: 3,
    resolvedComplaints: 4,
    closedComplaints: 1,
    rejectedComplaints: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DashboardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.setCooldown(0);
    try {
      localStorage.removeItem('cms_dashboard_cooldown_until');
    } catch {}
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch summary and cache it for subsequent non-forced calls', () => {
    let result1: ComplaintSummaryDto | undefined;
    let result2: ComplaintSummaryDto | undefined;

    service.getSummary(false).subscribe((res) => (result1 = res));
    const req = httpTesting.expectOne('/api/Dashboard/summary');
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);

    expect(result1).toEqual(mockSummary);

    // Second call with forceRefresh=false must use cache
    service.getSummary(false).subscribe((res) => (result2 = res));
    httpTesting.expectNone('/api/Dashboard/summary');
    expect(result2).toEqual(mockSummary);
  });

  it('should coalesce concurrent calls into a single in-flight request (single-flight)', () => {
    let resA: ComplaintSummaryDto | undefined;
    let resB: ComplaintSummaryDto | undefined;

    // Both call simultaneously with forceRefresh=true
    service.getSummary(true).subscribe((res) => (resA = res));
    service.getSummary(true).subscribe((res) => (resB = res));

    // Only ONE HTTP request should be in-flight
    const req = httpTesting.expectOne('/api/Dashboard/summary');
    req.flush(mockSummary);

    expect(resA).toEqual(mockSummary);
    expect(resB).toEqual(mockSummary);
  });

  it('should record rate limit cooldown on HTTP 429', () => {
    service.getSummary(true).subscribe({
      next: () => {},
      error: () => {}
    });

    const req = httpTesting.expectOne('/api/Dashboard/summary');
    req.flush({ message: 'Rate limit exceeded' }, {
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'Retry-After': '45' }
    });

    expect(service.isRateLimited()).toBe(true);
    expect(service.getCooldownRemainingSeconds()).toBeGreaterThanOrEqual(40);
  });

  it('should return cached stale data when rate-limited, and not issue HTTP requests', () => {
    // 1. First fetch data so stale cache exists
    service.getSummary(false).subscribe();
    const req = httpTesting.expectOne('/api/Dashboard/summary');
    req.flush(mockSummary);

    // 2. Activate rate limit cooldown
    service.setCooldown(60);
    expect(service.isRateLimited()).toBe(true);

    let res: ComplaintSummaryDto | undefined;
    service.getSummary(true).subscribe((data) => (res = data));

    // Zero HTTP requests should be made to the network
    httpTesting.expectNone('/api/Dashboard/summary');
    expect(res).toEqual(mockSummary);
  });

  it('should propagate 429 error without HTTP call when rate-limited and no cache exists', () => {
    service.setCooldown(60);
    expect(service.isRateLimited()).toBe(true);

    let errStatus = 0;
    service.getSummary(true).subscribe({
      next: () => {},
      error: (err) => {
        errStatus = err.status;
      }
    });

    httpTesting.expectNone('/api/Dashboard/summary');
    expect(errStatus).toBe(429);
  });
});

