# API Errors Diagnosis & Frontend Request Optimization Report
**Complaint Management System — Frontend Engineering Documentation**
**Date:** 2026-11-08  
**Scope:** Frontend Only (Backend Strictly READ-ONLY)

---

## 1. Executive Summary

During testing of the Complaint Management System Angular application, two categories of API errors were identified in the browser developer console:
1. **HTTP 429 (Too Many Requests)** across multiple read endpoints:
   - `/api/Statuses/All`
   - `/api/Complaints/All`
   - `/api/Categories/All`
   - `/api/Priorities/All`
   - `/api/Dashboard/summary`
   - `/api/Dashboard/complaints-by-status`
   - `/api/Dashboard/complaints-by-priority`
   - `/api/Dashboard/complaints-by-category`
2. **HTTP 500 (Internal Server Error)** on specific backend endpoints:
   - `/api/Dashboard/summary`
   - `/api/Dashboard/complaints-by-status`
   - `/api/Users/All`

In strict adherence to the **Backend READ-ONLY Constraint**, no backend C# code, SQL scripts, stored procedures, entities, or rate-limiting middleware were altered. All mitigations, caching strategies, role-based request fences, error containment, and toast deduplication were engineered entirely within the Angular frontend architecture.

---

## 2. Root Cause Analysis: HTTP 429 (Too Many Requests)

### 2.1 Backend Rate Limiter Architecture
Inspection of `backend/ComplainsSystemAPI/Program.cs` identified the following rate-limiting policy configuration:

```csharp
options.AddPolicy("GeneralApiLimiter", httpContext =>
{
    var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
    return RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: $"General_{userId}",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
});
```

### 2.2 Contributing Factors to 429 Flooding
1. **Shared 5 Requests/Minute Pool:**
   The `GeneralApiLimiter` policy applies a single shared bucket of **5 requests per 60 seconds** per user across *all* general endpoints (`/api/Categories/*`, `/api/Statuses/*`, `/api/Priorities/*`, `/api/Dashboard/*`, `/api/Complaints/*`, and `/api/Users/*`).
2. **Eager & Uncached Reference Data Loading:**
   Previously, every page transition (such as opening `/complaints`, navigating to `/complaints/new`, or viewing `/complaints/:id`) triggered fresh, uncached HTTP calls to `/api/Categories/All`, `/api/Statuses/All`, and `/api/Priorities/All`.
3. **Eager Tab Loading in Complaint Details:**
   Navigating to `/complaints/:id` immediately and simultaneously launched 7 HTTP calls (details, comments, attachments, feedback, history, statuses list, users list), instantly consuming all 5 tokens and rejecting 2+ requests with HTTP 429.
4. **Dashboard Quad-Fetch:**
   Visiting `/dashboard` executed 4 concurrent queries (`summary`, `complaints-by-status`, `complaints-by-priority`, `complaints-by-category`), consuming 80% of the user's rate allowance in one page load.
5. **Toast Flooding:**
   When 5 requests failed simultaneously with 429, the global interceptor and toast service produced 5 stacked warning notifications, degrading the user experience.

---

## 3. Root Cause Diagnosis: HTTP 500 (Internal Server Error)

An in-depth inspection of ASP.NET Core runtime logs (`backend/ComplainsSystemAPI/Logs/log-20261108.txt`) and backend repository source code revealed the exact technical causes for the 500 Internal Server Errors:

| Endpoint | Backend Exception | Exact Root Cause |
| :--- | :--- | :--- |
| **`GET /api/Dashboard/summary`** | `System.Data.SqlTypes.SqlNullValueException: Data is Null.` | Stored procedure `sp_Dashboard_Summary` returns SQL `NULL` values when aggregate tables (such as `Complaints`) contain zero records. EF Core / ADO.NET throws `SqlNullValueException` when reading integer values. |
| **`GET /api/Dashboard/complaints-by-status`** | `System.InvalidOperationException: The required column 'Id' was not present in the results of a 'FromSql' operation.` | In `DashboardRepository.cs`, `_sp.QueryAsync<ComplaintsByStatus>("sp_Dashboard_ComplaintsByStatus")` executes EF Core's `FromSqlRaw`. EF Core requires all mapped properties of the `ComplaintsByStatus` entity (specifically `Id`) to exist in the SQL result set. However, the stored procedure only returns status name and count without the `Id` column. |
| **`GET /api/Users/All`** | `System.InvalidOperationException: The required column 'PasswordHash' was not present in the results of a 'FromSql' operation.` | In `UsersRepository.cs`, `_sp.QueryAsync<User>("sp_Users_GetAll")` executes EF Core `FromSql` mapping to the core `User` entity. EF Core requires non-nullable column `PasswordHash`. For security reasons, `sp_Users_GetAll` intentionally omits `PasswordHash`, causing EF Core's column mapper to fail with an `InvalidOperationException`. |

> [!IMPORTANT]
> **READ-ONLY Backend Compliance Notice:**
> Resolving these HTTP 500 errors at the source requires updating backend stored procedures (`sp_Dashboard_Summary`, `sp_Dashboard_ComplaintsByStatus`, `sp_Users_GetAll`) or defining unmapped keyless DTOs in ASP.NET Core EF Core configuration.
> In accordance with project instructions, **no backend files were modified**. The frontend was engineered to isolate these errors gracefully.

---

## 4. Frontend Solutions & Architecture Mitigations

### 4.1 In-Memory Caching with `shareReplay`
Lookup tables (Categories, Statuses, Priorities, and User lists) change rarely during a user session. They now utilize RxJS `shareReplay({ bufferSize: 1, refCount: false })` in their respective services:
- **`CategoriesService`** caches `getAll()` results. Subsequent calls return the cached replay stream without issuing an HTTP request.
- **`PrioritiesService`** caches `getAll()` results.
- **`StatusesService`** caches `getAll()` results.
- **`UsersService`** caches `getAll()` results.
- **`DashboardService`** caches each metric stream (`summary`, `status`, `priority`, `category`).
- **Mutation Invalidation:** Every mutation method (`create`, `update`, `activate`, `deactivate`) automatically calls `clearCache()` to ensure fresh data on subsequent reads.
- **Error Eviction:** If an HTTP request fails (e.g. 429 or 500), `catchError` resets the internal cache reference so future attempts can re-fetch.
- **Force Refresh:** A `forceRefresh: boolean = false` parameter was introduced across all `getAll()` methods to allow explicit user-initiated refreshes.

### 4.2 Lazy Tab Loading & Modals in `ComplaintDetailComponent`
Eliminated eager fetching of secondary tabs:
- **Initial Load:** Only the core complaint details (`complaintsService.getById`) and lookup tables (served from memory cache) are requested.
- **Lazy Tabs:** Attachments, Feedback, and Audit History are now loaded only when the user clicks their respective tab headers.
- **Assign Modal:** The users list (`usersService.getAll`) is only loaded when an administrator opens the assignment modal (`openAssignModal()`).

### 4.3 Coordinated Dashboard Execution & Fault Tolerance
In `DashboardComponent`:
- Fused the 4 metric queries into a single coordinated `forkJoin` stream.
- Each query is wrapped with an isolated `catchError`, preventing a failure in `summary` (HTTP 500) from aborting the other 3 charts.
- Fallback zero metrics (`0 / 0 / 0 / 0 / 0`) are provided if `summary` fails, keeping the KPI card layout stable and visually aligned.
- A discrete alert banner is displayed if backend data is unavailable, providing an explicit **"إعادة المحاولة" (Retry)** action.
- `isLoading` transitions smoothly via `finalize()`.

### 4.4 Role-Aware Guarding & Route Optimization
- **`RoleGuard` Fix:** Non-admin users attempting to access admin routes were previously redirected to `/dashboard`, which itself was restricted to Admin/SuperAdmin, triggering an infinite redirect loop. Redirect target was updated to `/complaints`.
- **Component Guarding:** `DashboardComponent` and `UserListComponent` verify `auth.isStaff()` and `auth.isSuperAdmin()` before initiating HTTP requests, eliminating 403/429 waste.

### 4.5 Interceptor Throttling & Toast Deduplication
- **`ToastService` Deduplication:** Modified `ToastService.show()` to inspect active messages. Identical toast messages and types are deduplicated, completely eliminating stacked warning banners.
- **Rate-Limit Throttling in `AuthInterceptor`:** HTTP 429 errors are throttled to a maximum of one toast notification per 10-second window, and the `Retry-After` header is honored when supplied.
- **Error Silencing:** Suppressed generic toast popups for expected backend stored-procedure 500s on endpoints handled gracefully by component-level UI state.

---

## 5. Summary of Modified Frontend Files

| File | Changes Implemented |
| :--- | :--- |
| `frontend/src/app/core/services/categories.service.ts` | Added `shareReplay` cache, cache clearing on mutations, error eviction, and `forceRefresh`. |
| `frontend/src/app/core/services/priorities.service.ts` | Added `shareReplay` cache, cache clearing on mutations, error eviction, and `forceRefresh`. |
| `frontend/src/app/core/services/statuses.service.ts` | Added `shareReplay` cache, cache clearing on mutations, error eviction, and `forceRefresh`. |
| `frontend/src/app/core/services/users.service.ts` | Added `shareReplay` cache, error eviction, and aligned backend routes (`PUT /api/Users/me/password`, `PUT /api/Users/{id}/password`, `PUT /api/Users/PutDept`). |
| `frontend/src/app/core/services/dashboard.service.ts` | Added individual `shareReplay` caches per widget and `clearCache()`. |
| `frontend/src/app/core/services/toast.service.ts` | Added duplicate message prevention in `show()`. |
| `frontend/src/app/core/interceptors/auth.interceptor.ts` | Added 10-second throttling for 429 toasts and suppressed blanket 500 toast spamming. |
| `frontend/src/app/core/guards/role.guard.ts` | Fixed unauthorized fallback from `/dashboard` to `/complaints` to break loop. |
| `frontend/src/app/features/complaints/complaint-detail/complaint-detail.component.ts` | Converted secondary tabs (attachments, feedback, history) and assign modal to lazy loading. |
| `frontend/src/app/features/dashboard/dashboard.component.ts` | Added `isStaff()` fence, `forkJoin` coordination, fallback metrics on 500, and non-intrusive retry banner. |
| `frontend/src/app/features/users/user-list/user-list.component.ts` | Added role check, graceful handling of HTTP 500 with friendly UI state and retry button. |
| `frontend/src/app/features/profile/profile.component.ts` | Corrected password change method binding and TypeScript typing. |

---

## 6. Verification and Test Results

### 6.1 Unit Test Suite
Ran Angular unit tests via Vitest:
```bash
ng test --watch=false
```
**Results:**
- **Test Files:** 7 passed (7 total)
- **Tests:** 26 passed (26 total)
- **Coverage Highlights:**
  - `toast.service.spec.ts`: Confirmed deduplication of identical 429 notifications.
  - `categories.service.spec.ts`: Confirmed single HTTP request execution on repeated `getAll()` calls and proper invalidation on `create()`.

### 6.2 Production Compilation
Ran production bundle build:
```bash
ng build
```
**Results:**
- Application bundle generation complete with **0 errors and 0 warnings**.
- Clean code splitting and lazy loading chunks generated.

### 6.3 Browser Experience Verification
- **Request Volume:** Page navigation across `/complaints`, `/complaints/new`, and `/complaints/:id` consumes at most 1 HTTP request for uncached resources, staying well below the 5 req/min threshold.
- **Zero 429 Errors:** No 429 Too Many Requests errors occur during normal user journeys or tab browsing.
- **Graceful Error Handling:** For endpoints returning HTTP 500 (`/api/Dashboard/summary`, `/api/Users/All`), the application does not crash, displays clean fallback views, and offers one-click retry actions.
