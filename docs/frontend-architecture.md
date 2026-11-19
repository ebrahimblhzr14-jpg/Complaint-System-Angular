# Frontend Architecture & Design System Documentation

## 1. Architectural Philosophy
The frontend is engineered as a modern, high-performance enterprise SaaS web application built with **Angular 22** using standalone components, Reactive Forms, reactive Signals, and TypeScript strict mode.

---

## 2. Directory Structure
```text
frontend/src/app/
├── core/
│   ├── auth/              # AuthService, token management, session persistence
│   ├── guards/            # AuthGuard, RoleGuard (SuperAdmin, Admin, User)
│   ├── interceptors/      # AuthInterceptor (Bearer injection, auto refresh, 401 handling)
│   ├── models/            # Strongly-typed domain models & DTOs
│   ├── services/          # Domain API services (Complaints, Dashboard, Users, Reference data)
│   └── theme/             # Centralized ThemeService (Light & Dark mode state, persistence)
├── features/
│   ├── auth/              # Split-screen Login and Registration pages
│   ├── dashboard/         # Executive analytics dashboard with Chart.js
│   ├── complaints/        # List, creation wizard, and complaint detail workspace
│   ├── users/             # User management table, role assignment
│   ├── categories/        # Category management
│   ├── priorities/        # Priority level management
│   ├── statuses/          # Status workflow management
│   └── profile/           # User profile & credentials overview
├── layout/
│   ├── main-layout/       # App shell containing Sidebar, Topbar, and RouterOutlet
│   ├── sidebar/           # Collapsible navigation sidebar with active route highlighting
│   └── topbar/            # Breadcrumbs, quick search, language picker, theme toggle, user menu
└── shared/
    ├── components/        # Toast, ConfirmDialog, StatusBadge, EmptyState, LoadingSkeleton
    └── pipes/             # TranslatePipe (Arabic/English bidirectional dictionary)
```

---

## 3. Design System & Theming Engine
### 3.1 Design Palette
- **Light Theme:**
  - `Midnight Ink`: `#171B2D`
  - `Warm Canvas`: `#F6F5F1`
  - `Electric Indigo`: `#5268F5`
  - `Fresh Mint`: `#36C9B0`
  - `Soft Coral`: `#FF806B`
  - `Warm Amber`: `#E9B85C`
  - `White Surface`: `#FFFFFF`
- **Dark Theme:**
  - `Main Background`: `#10131F`
  - `Primary Surface`: `#171B2D`
  - `Secondary Surface`: `#1D2335`
  - `Elevated Surface`: `#252C40`
  - `Primary Text`: `#F2F4FA`
  - `Secondary Text`: `#A5ADC2`
  - `Muted Text`: `#778198`
  - `Borders`: `#30394F`
  - `Primary Accent`: `#7185FF`
  - `Secondary Accent`: `#43D8BE`

### 3.2 Dynamic Theming Engine (`ThemeService`)
- Uses Angular Signals `theme = signal<'light' | 'dark'>('light')`.
- Persists user choice in `localStorage`.
- Listens to OS `prefers-color-scheme` media queries when no preference is stored.
- Applies `.dark` class to `<html>` and updates CSS custom properties smoothly with CSS transitions.
- Dynamically notifies Chart.js to re-render grid lines, tooltips, and axis colors without full page refresh.

---

## 4. Internationalization & Bidirectional Layouts (RTL / LTR)
- **Default Language:** Arabic (`ar`), RTL (`dir="rtl"`).
- **Secondary Language:** English (`en`), LTR (`dir="ltr"`).
- **Typography:** Cairo font for Arabic typography, Inter for English.
- **Pipes:** Custom reactive `translate` pipe translating keys on the fly.

