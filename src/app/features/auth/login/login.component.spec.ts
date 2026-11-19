import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginComponent - Form Credential Hygiene', () => {
  let component: LoginComponent;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should initialize with empty email and password fields', () => {
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should clear password and reset form immediately upon successful login', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      of({
        accessToken: 'mock_token',
        refreshToken: 'mock_refresh',
        expiresAt: new Date().toISOString()
      })
    );
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.setValue({
      email: 'admin@shakowa.com',
      password: 'SecretPassword123!'
    });

    component.onSubmit();

    // Password and email must be completely cleared from form model
    expect(component.form.get('password')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
  });

  it('should wipe password immediately upon login failure, but preserve email', () => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Invalid credentials' }
    });
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => errorResponse));

    component.form.setValue({
      email: 'user@shakowa.com',
      password: 'WrongPassword!'
    });

    component.onSubmit();

    // Password must be wiped clean from memory/control
    expect(component.form.get('password')?.value).toBe('');
    // Email must be preserved so user does not need to retype it
    expect(component.form.get('email')?.value).toBe('user@shakowa.com');
    expect(component.errorMessage()).toBeTruthy();
  });

  it('should clear all credentials on ngOnDestroy', () => {
    component.form.setValue({
      email: 'user@shakowa.com',
      password: 'SecretPassword!'
    });

    component.ngOnDestroy();

    expect(component.form.get('password')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
  });

  it('should clear all credentials on ngOnInit', () => {
    component.form.setValue({
      email: 'user@shakowa.com',
      password: 'SecretPassword!'
    });

    component.ngOnInit();

    expect(component.form.get('password')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
  });
});
