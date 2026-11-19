# Complete Project Discovery & Technical Audit

## 1. Executive Summary
This document records the comprehensive architectural audit of the **Complaint Management Project** (نظام إدارة الشكاوى المتقدم), covering the ASP.NET Core 8 backend, the Angular 22 frontend, SQL Server integration, security profiles, and development orchestration.

---

## 2. Environment & Tooling Audit
- **Host OS:** Windows 11 Pro / PowerShell
- **Node.js Version:** `v24.18.0`
- **npm Version:** `11.18.0`
- **Angular CLI:** `22.0.4`
- **.NET SDK:** `10.0.401` (Compiling targeting `net8.0`)
- **SQL Server Instance:** `.` (`MSSQLSERVER` active service, SQL Server 2022 v16.0)
- **Database:** `ComplaintManagementDB` (13 tables, stored procedures, initial seed data)

---

## 3. Backend Architecture Audit
### 3.1 Solution Structure
- `ComplainsSystemAPI`: ASP.NET Core 8 Web API (Startup / Host project).
- `ComplaintManagement.Business`: Business logic services, DTOs, validations, security hashers, and interfaces.
- `ComplaintManagement.Access.EFCore`: Data access layer, Entity Framework Core `ComplaintDbContext`, repositories, and entities.
- `ComplaintsDB_Schema.sql`: Database schema definition with 13 tables and 28+ stored procedures.

### 3.2 Network & Launch Configuration
- **Launch Settings Profile:** `https`
- **HTTPS URL:** `https://localhost:7043`
- **HTTP URL:** `http://localhost:5199`
- **CORS Allowed Origins:** Configured for local development. Handled safely via Angular development proxy (`proxy.conf.json`) forwarding `/api` and `/Images` to `https://localhost:7043`.

### 3.3 Rate Limiting Architecture
- `AuthLimiter`: 5 requests per 2 minutes on `/api/Auth/login`.
- `SingInLimiter`: 1 request per 15 minutes per IP on `/api/Auth/SingIn`.
- `GeneralLimiter`: 60 requests per 1 minute on general endpoints.
- `CreateLimiter`: 10 requests per 1 minute on create operations.

---

## 4. Frontend Architecture Audit
- **Framework:** Angular 22 (Standalone components, Signals, Reactive Forms, SCSS).
- **Styling:** Tailwind CSS v4 with custom CSS design tokens for Light and Dark modes.
- **Icons:** `@lucide/angular` (Modern, tree-shakeable icon system).
- **Typography:** Cairo font (Arabic default, RTL enabled) and Inter (English, LTR).
- **State Management:** Reactive Signals for auth state, active theme, and language.
- **HTTP Layer:** Centralized `ApiClient` and domain services with `authInterceptor` injecting Bearer JWT tokens and handling 401 refresh flows.
- **Theme System:** Centralized `ThemeService` with Light/Dark modes, OS detection, local storage persistence, and zero-flicker initialization.
- **Test Runner:** Angular 22 Vitest runner (`ng test --watch=false`).

---

## 5. Security & Boundary Compliance
- **Backend Protection:** The backend source code, configurations, database connection strings, and endpoints remain completely unchanged and read-only.
- **Secrets Management:** No JWT secret keys, DB passwords, or administrative tokens are hardcoded or exposed in the frontend. All authentication operates via JWT tokens issued by `/api/Auth/login` and `/api/Auth/SingIn`.

