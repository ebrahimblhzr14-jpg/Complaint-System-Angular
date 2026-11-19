import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordRequest,
  AdminChangePasswordRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Users';

  private cache$: Observable<UserDto[]> | null = null;

  /**
   * Retrieves all users (SuperAdmin only). Uses in-memory shareReplay cache.
   * @param forceRefresh When true, bypasses the cache and issues a fresh HTTP request.
   */
  getAll(forceRefresh = false): Observable<UserDto[]> {
    if (forceRefresh || !this.cache$) {
      this.cache$ = this.http.get<UserDto[]>(`${this.baseUrl}/All`).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError((err) => {
          this.cache$ = null;
          return throwError(() => err);
        })
      );
    }
    return this.cache$;
  }

  clearCache(): void {
    this.cache$ = null;
  }

  // Owner or SuperAdmin
  getById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/FindBy/${id}`);
  }

  // SuperAdmin only
  create(dto: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/Create`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  // Owner or SuperAdmin
  update(id: number, dto: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.baseUrl}/Update/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  // SuperAdmin only
  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activate`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  // SuperAdmin only
  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  // SuperAdmin only
  putDepartment(userId: number, depId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/PutDept?UserId=${userId}&DepID=${depId}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  // Authenticated user (self)
  changeMyPassword(dto: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/password`, dto);
  }

  changePassword(dto: ChangePasswordRequest): Observable<void> {
    return this.changeMyPassword(dto);
  }

  // SuperAdmin only (admin reset)
  adminChangePassword(userId: number, dto: AdminChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/password`, dto);
  }
}
