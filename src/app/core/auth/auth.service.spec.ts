import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'auth/login', component: class {} }])
      ]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should initialize with null user when no token exists', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should correctly clear tokens upon logoutLocal', () => {
    localStorage.setItem('cms_access_token', 'dummy_token');
    localStorage.setItem('cms_refresh_token', 'dummy_refresh');

    service.logoutLocal();

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('should share in-flight refresh request among concurrent callers (single-flight refresh)', () => {
    localStorage.setItem('cms_refresh_token', 'my_refresh_token');

    let res1: LoginResponse | null | undefined;
    let res2: LoginResponse | null | undefined;

    // Trigger concurrent refresh calls
    service.refreshToken().subscribe((res) => (res1 = res));
    service.refreshToken().subscribe((res) => (res2 = res));

    // Only ONE HTTP POST should be triggered
    const req = httpTesting.expectOne('/api/Auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'my_refresh_token' });

    const mockResponse: LoginResponse = {
      accessToken: 'header.eyJzdWIiOiIxIiwibmFtZSI6IlRlc3QiLCJyb2xlIjoiVXNlciJ9.signature',
      refreshToken: 'new_refresh_token'
    };

    req.flush(mockResponse);

    expect(res1).toEqual(mockResponse);
    expect(res2).toEqual(mockResponse);
    expect(service.getAccessToken()).toBe(mockResponse.accessToken);
    expect(service.getRefreshToken()).toBe(mockResponse.refreshToken);
  });

  it('should return null when refreshToken is called without a stored refresh token', () => {
    let result: LoginResponse | null | undefined;
    service.refreshToken().subscribe((res) => (result = res));

    httpTesting.expectNone('/api/Auth/refresh');
    expect(result).toBeNull();
  });
});
