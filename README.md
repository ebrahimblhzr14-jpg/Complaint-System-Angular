# نظام إدارة الشكاوى المتقدم (Premium Complaint Management System)
### Enterprise Angular Frontend Solution

---

## 1. Project Overview
This project is an enterprise-grade web application engineered in **Angular 22** for the Complaint Management System. It features an Arabic-first Right-to-Left (RTL) interface with instant bilingual support (Arabic / English), role-based access control, reactive data state with Angular Signals, real-time analytics with Chart.js, and a bespoke design system built with Tailwind CSS v4 and SCSS.

The frontend is engineered to integrate cleanly with the existing ASP.NET Core backend API (`https://localhost:7208`), strictly respecting the Read-Only backend boundary and handling all route templates, rate limits, and query binding requirements.

---

## 2. Prerequisites
- **Node.js:** v20.x, v22.x, or v24.x (tested on v24.18.0)
- **NPM:** v10.x or v11.x (tested on v11.18.0)
- **ASP.NET Core Backend:** Running on `https://localhost:7208` or `http://localhost:5199`

---

## 3. Installation
From the workspace root directory, navigate into `frontend`:

```bash
cd frontend
npm install --legacy-peer-deps
```

---

## 4. Running the Development Environment

### One-Command Startup (Backend + Frontend)
To run both the ASP.NET Core backend and the Angular frontend together with synchronized terminal output:

```bash
npm run dev:all
```

This single command:
1. Starts the ASP.NET Core API on `https://localhost:7043` using its `https` launch profile.
2. Starts the Angular frontend on `http://localhost:4200` with the proxy attached.
3. Automatically shuts down both processes cleanly when stopped (`Ctrl + C`).

### Running Separately
- **Frontend only:**
  ```bash
  npm start
  ```
- **Backend only:**
  ```bash
  npm run dev:backend
  ```

---

## 5. Production Build
To create a production-optimized build:

```bash
npm run build
```
Artifacts are generated in `frontend/dist/frontend`.

---

## 6. Testing Instructions
To execute the unit test suite via Vitest:

```bash
npm test -- --watch=false
```

---

## 7. API Proxy Configuration (`proxy.conf.json`)
The Angular CLI development proxy automatically forwards `/api` and `/Images` requests to the backend HTTPS port `https://localhost:7043`:

```json
{
  "/api": {
    "target": "https://localhost:7043",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/Images": {
    "target": "https://localhost:7043",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 8. Authentication & Security Architecture
- **JWT Storage:** Access and refresh tokens are stored in `localStorage` (`cms_access_token`, `cms_refresh_token`).
- **Claim Extraction:** Decodes user ID (`nameid` / `sub`), display name, email, and role (`SuperAdmin`, `Admin`, `User`).
- **HTTP Interceptor:**
  - Attaches Bearer token to all `/api/*` requests.
  - Automatically intercepts `401 Unauthorized` responses and performs silent token refresh via `/api/Auth/refresh`.
  - Handles `429 Too Many Requests` (Rate Limiting) with friendly user-facing cooldown warnings.
  - Handles `403 Forbidden` and network connection failures (`status 0`) gracefully.
- **Guards:**
  - `authGuard`: Protects private application routes from unauthenticated users.
  - `guestGuard`: Prevents logged-in users from accessing login and registration pages.
  - `roleGuard`: Enforces role-based route access according to the system authorization matrix.

---

## 9. Design System & Theming Tokens
- **Design Palette:**
  - Primary: `#17365D`
  - Secondary: `#244B75`
  - Accent: `#16B8A6`
  - Background: `#F5F7FB`
  - Surface: `#FFFFFF`
  - Success: `#16A36A`
  - Warning: `#E9A23B`
  - Danger: `#DC5252`
- **Typography:**
  - Arabic: **Cairo** font family with appropriate letter-spacing and line heights.
  - English: **Inter** font family.
- **RTL / LTR Engine:**
  - Arabic is the default language.
  - Direction toggling updates `<html lang="ar" dir="rtl">` dynamically using logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, `border-inline`).
  - Signal-powered `TranslationService` with comprehensive Arabic/English dictionary keys.

---

## 10. Folder Structure
```text
frontend/
├── docs/
│   ├── backend-analysis.md        # Solution architecture & endpoint inventory
│   ├── api-contract.md            # Complete API contract specification
│   ├── authorization-matrix.md    # Role and policy access matrix
│   ├── integration-issues.md      # Backend quirks, double colons, & safe workarounds
│   └── data-model.md              # TypeScript interfaces matching backend DTOs
├── src/
│   ├── index.html                 # Google Fonts & RTL default setup
│   ├── styles.scss                # Tailwind v4, tokens, badges, buttons, cards
│   ├── main.ts                    # Bootstrap entry point
│   └── app/
│       ├── app.routes.ts          # Lazy-loaded feature routes with guards
│       ├── app.config.ts          # HttpClient, interceptors, charts providers
│       ├── core/
│       │   ├── auth/              # AuthService & token handling
│       │   ├── guards/            # authGuard, guestGuard, roleGuard
│       │   ├── interceptors/      # authInterceptor (JWT, 401, 429, 403 handling)
│       │   ├── models/            # Strongly-typed TypeScript interfaces
│       │   └── services/          # Complaints, Dashboard, Users, Categories, etc.
│       ├── shared/
│       │   ├── components/        # Toast, ConfirmDialog, StatusBadge, Skeletons, EmptyState
│       │   └── pipes/             # TranslatePipe
│       ├── layout/
│       │   ├── main-layout/       # App shell with responsive sidebar & topbar
│       │   ├── sidebar/           # Role-based collapsible navigation
│       │   └── topbar/            # Profile dropdown & language switcher
│       └── features/
│           ├── auth/              # Login & Register (SingIn) components
│           ├── dashboard/         # Real-time metrics & Chart.js charts
│           ├── complaints/        # Complaints list, details, creation, comments, attachments
│           ├── users/             # User management, activation toggle, reset password
│           ├── categories/        # Reference data CRUD & activation
│           ├── priorities/        # Reference data CRUD & levels
│           └── statuses/          # Reference data CRUD & preview
├── proxy.conf.json                # Dev proxy to https://localhost:7208
├── angular.json                   # Build configuration
└── package.json                   # Dependencies
```
