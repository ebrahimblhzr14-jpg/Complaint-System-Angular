import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError, finalize, shareReplay } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  CurrentUser
} from '../models';
import { ToastService } from '../services/toast.service';
import { CategoriesService } from '../services/categories.service';
import { StatusesService } from '../services/statuses.service';
import { PrioritiesService } from '../services/priorities.service';
import { UsersService } from '../services/users.service';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private translation = inject(TranslationService);
  private categoriesService = inject(CategoriesService);
  private statusesService = inject(StatusesService);
  private prioritiesService = inject(PrioritiesService);
  private usersService = inject(UsersService);
  private dashboardService = inject(DashboardService);

  private readonly ACCESS_TOKEN_KEY = 'cms_access_token';
  private readonly REFRESH_TOKEN_KEY = 'cms_refresh_token';

  currentUser = signal<CurrentUser | null>(this.loadUserFromToken());
  isAuthenticated = computed(() => !!this.currentUser());
  isSuperAdmin = computed(() => this.currentUser()?.role === 'SuperAdmin');
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');
  isStaff = computed(() => this.isSuperAdmin() || this.isAdmin());

  private refreshInProgress$: Observable<LoginResponse | null> | null = null;

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearAllCaches(): void {
    try {
      localStorage.removeItem('cms_dashboard_cooldown_until');
    } catch {}
    this.categoriesService.clearCache();
    this.statusesService.clearCache();
    this.prioritiesService.clearCache();
    this.usersService.clearCache();
    this.dashboardService.clearCache();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/Auth/login', credentials).pipe(
      tap((res) => {
        this.clearAllCaches();
        this.saveTokens(res.accessToken, res.refreshToken);
        this.currentUser.set(this.decodeToken(res.accessToken));
        this.toast.success(this.translation.translate('loginSuccess'), this.translation.translate('welcomeUser'));
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    // Note: Backend endpoint is named SingIn
    return this.http.post<LoginResponse>('/api/Auth/SingIn', data).pipe(
      tap((res) => {
        this.clearAllCaches();
        this.saveTokens(res.accessToken, res.refreshToken);
        this.currentUser.set(this.decodeToken(res.accessToken));
        this.toast.success(this.translation.translate('registerSuccess'), this.translation.translate('welcomeUser'));
      })
    );
  }

  refreshToken(): Observable<LoginResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }

    // Share in-flight refresh observable across concurrent 401 calls
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const req: RefreshTokenRequest = { refreshToken };

    this.refreshInProgress$ = this.http.post<LoginResponse>('/api/Auth/refresh', req).pipe(
      tap((res) => {
        if (res?.accessToken) {
          this.saveTokens(res.accessToken, res.refreshToken);
          this.currentUser.set(this.decodeToken(res.accessToken));
        }
      }),
      catchError((err) => {
        this.logoutLocal();
        return throwError(() => err);
      }),
      finalize(() => {
        this.refreshInProgress$ = null;
      }),
      shareReplay(1)
    );

    return this.refreshInProgress$;
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post('/api/Auth/logout', { refreshToken }).subscribe({
        next: () => this.logoutLocal(),
        error: () => this.logoutLocal()
      });
    } else {
      this.logoutLocal();
    }
  }

  logoutLocal(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.clearAllCaches();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private loadUserFromToken(): CurrentUser | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  private decodeToken(token: string): CurrentUser | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        decodeURIComponent(
          atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      );

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      const id = parseInt(
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
          payload['nameid'] ||
          payload['sub'] ||
          '0',
        10
      );

      const name =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        payload['unique_name'] ||
        payload['name'] ||
        '';

      const email =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        payload['email'] ||
        '';

      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        'User';

      let roleId = 1;
      if (role === 'SuperAdmin') roleId = 3;
      else if (role === 'Admin') roleId = 2;

      return { id, name, email, role, roleId };
    } catch {
      return null;
    }
  }
}

