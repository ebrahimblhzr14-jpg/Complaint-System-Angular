import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Auth Routes
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },

  // Protected App Routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'complaints'
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./features/complaints/complaint-list/complaint-list.component').then(
            (m) => m.ComplaintListComponent
          )
      },
      {
        path: 'complaints/new',
        loadComponent: () =>
          import('./features/complaints/complaint-create/complaint-create.component').then(
            (m) => m.ComplaintCreateComponent
          )
      },
      {
        path: 'complaints/:id',
        loadComponent: () =>
          import('./features/complaints/complaint-detail/complaint-detail.component').then(
            (m) => m.ComplaintDetailComponent
          )
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin'] },
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then((m) => m.UserListComponent)
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () =>
          import('./features/categories/categories.component').then(
            (m) => m.CategoriesComponent
          )
      },
      {
        path: 'priorities',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () =>
          import('./features/priorities/priorities.component').then(
            (m) => m.PrioritiesComponent
          )
      },
      {
        path: 'statuses',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () =>
          import('./features/statuses/statuses.component').then(
            (m) => m.StatusesComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'complaints'
  }
];
