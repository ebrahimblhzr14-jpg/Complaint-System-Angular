import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { StatusDto, CreateStatusDto, UpdateStatusDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StatusesService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Statuses';

  private cache$: Observable<StatusDto[]> | null = null;

  /**
   * Retrieves all complaint statuses. Uses in-memory shareReplay cache to respect the backend 5 req/min rate limit.
   * @param forceRefresh When true, bypasses the cache and issues a fresh HTTP request.
   */
  getAll(forceRefresh = false): Observable<StatusDto[]> {
    if (forceRefresh || !this.cache$) {
      this.cache$ = this.http.get<StatusDto[]>(`${this.baseUrl}/All`).pipe(
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

  getById(id: number): Observable<StatusDto> {
    return this.http.get<StatusDto>(`${this.baseUrl}/FindBy/${id}`);
  }

  create(dto: CreateStatusDto): Observable<StatusDto> {
    return this.http.post<StatusDto>(`${this.baseUrl}/create`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, dto: UpdateStatusDto): Observable<StatusDto> {
    return this.http.put<StatusDto>(`${this.baseUrl}/Update/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/activate/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/deactivate/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }
}
