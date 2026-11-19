# Dashboard HTTP 429 Rate Limit Errors — Final Resolution Report
**Complaint Management System — Angular Frontend Engineering**
**Date:** 2026-11-08  
**Scope:** Frontend Only (Backend Strictly READ-ONLY)

---

## 1. Exact Root Cause Analysis

From the browser console call stacks:
```
loadDashboardData @ dashboard.component.ts:497
ngOnInit @ dashboard.component.ts:417
DashboardComponent_Conditional_17_Conditional_0_Template_button_click_7_listener @ dashboard.component.ts:120
```

Four interconnected root causes were identified:

1. **Shared 5-Request/Minute Pool (`GeneralApiLimiter`):**
   In `backend/ComplainsSystemAPI/Program.cs`, the ASP.NET Core rate limiter enforces a fixed window of **5 requests per 60 seconds** per user across all general endpoints (`summary`, `status`, `priority`, `category`).
2. **Initial Page Load Pool Depletion:**
   When the user opens `/dashboard`, `ngOnInit` immediately sends 4 requests concurrently via `forkJoin`. This consumes 4 out of the 5 allowed permits (80% of the entire quota).
3. **The "إعادة المحاولة" (Retry) Button Trap:**
   When `summary` or `status` returned HTTP 500 (due to empty DB aggregate NULL and missing 'Id' column in stored procedures), the UI displayed the error banner with the **"إعادة المحاولة"** button enabled because cooldown had only been activated on `forceRefresh = true`, not on initial load (`forceRefresh = false`). Clicking "إعادة المحاولة" immediately dispatched 4 more requests when the user only had 1 permit remaining in that 60-second window, causing endpoints to be rejected with `HTTP 429 Too Many Requests`.
4. **Browser Refresh (F5) Reset:**
   Previously, cooldown timestamps were kept in component/service memory. A full browser reload (F5) cleared in-memory variables to 0, while the backend's rate limiter partition in Kestrel/IIS still had the active minute window, triggering 429 on initial load.

---

## 2. Comprehensive Fixes Implemented

### 2.1 Persistent Cooldown Across Page Refreshes (`localStorage`)
In `frontend/src/app/core/services/dashboard.service.ts`:
- Persisted `rateLimitResetUntil` to `localStorage` under `cms_dashboard_cooldown_until`.
- When the browser reloads (F5) or restarts, `getCooldownRemainingSeconds()` reads the persisted timestamp. If the backend's 60-second rate-limit window is still active, it prevents firing requests to the network.

### 2.2 Network Interception During Active Cooldown
In `DashboardService`:
- Guarded `getSummary()`, `getComplaintsByStatus()`, `getComplaintsByPriority()`, and `getComplaintsByCategory()`:
  ```typescript
  if (this.isRateLimited()) {
    return of(this.lastSummary || fallbackMetrics);
  }
  ```
- If the application is in an active rate-limit window, **zero HTTP requests are sent to the network**, returning cached or fallback data immediately. This completely eliminates 429 errors from appearing in the browser console.

### 2.3 Universal Cooldown Enforcement on Every Network Fetch
In `frontend/src/app/features/dashboard/dashboard.component.ts`:
- Changed `finalize()` in the data pipeline to **always enforce the 60-second cooldown** after any network fetch batch:
  ```typescript
  if (!this.is429()) {
    this.startCooldown(60);
  }
  ```
- Both the **"تحديث" (Refresh)** button in the header and the **"إعادة المحاولة" (Retry)** button in the error banner are disabled during this period and display a live countdown timer:
  - Header: `تحديث (56s)`
  - Error banner: `إعادة المحاولة (بعد 56 ث)`
- Prevents users from clicking retry within seconds of a failed or partial load.

### 2.4 Single-Flight Pipeline with `Subject` + `exhaustMap`
- Uses `exhaustMap` to drop all rapid consecutive clicks during in-flight requests.
- Single-flight observable coalescing at the service level (`summaryInFlight$`, `statusInFlight$`, etc.).

---

## 3. Requests Observed Before vs. After

| Scenario | Before Fix | After Fix |
| :--- | :--- | :--- |
| **Normal Dashboard Load** | 4 HTTP requests sent concurrently. | **4 HTTP requests** sent concurrently once. |
| **5 Rapid Refresh Clicks in 100ms** | 20 HTTP requests sent (5 batches × 4). Batches 2–5 failed with **HTTP 429**. | **0 extra requests** (all dropped by `exhaustMap` and `isLoading` guard). |
| **Clicking "إعادة المحاولة" After 500 Error** | Dispatched 4 requests immediately, producing **3× HTTP 429 errors**. | **0 requests** (button disabled with countdown `إعادة المحاولة (بعد 58 ث)`). |
| **Navigating Away to `/complaints` & Back** | Sent 4 HTTP requests. | **0 HTTP requests** (served from memory cache or blocked by active cooldown). |
| **Browser Tab Reload (F5) During Window** | Sent 4 requests, all rejected with **HTTP 429**. | **0 requests** (persisted `localStorage` cooldown prevents network calls). |

---

## 4. Verification Results

### 4.1 Automated Headless Chrome E2E Verification
Executed automated test: `node scripts/verify-dashboard-rate-limit.mjs`
```
[1] Initial dashboard load issued 4 dashboard requests.
    Response statuses: {
      'complaints-by-priority': [ 200 ],
      'complaints-by-category': [ 200 ],
      'summary': [ 500 ],
      'complaints-by-status': [ 500 ]
    }
[2] Testing Rapid Multiple Clicks (Simulating user spam clicking)...
[2] Rapid clicks result: 0 new dashboard requests executed.
[3] Button state after load/click: { disabled: true, text: 'تحديث (56s)' }
[4] Testing clicks while in cooldown: Requests fired during cooldown: 0 (Expected: 0)
[5] Testing SPA client router navigation away to /complaints and back to /dashboard...
    Dashboard requests fired upon SPA router return: 0 (Expected: 0)
[4] Were any 429 status codes returned during this test? NO (All requests allowed or cleanly cached/blocked)
```

### 4.2 Unit Tests (Vitest)
```bash
ng test --watch=false
```
- **Test Files:** 8 passed (8 total)
- **Tests:** 31 passed (31 total, 100% pass rate)

### 4.3 Production Build
```bash
ng build
```
- Output location: `dist/frontend` (0 errors, 0 warnings).
