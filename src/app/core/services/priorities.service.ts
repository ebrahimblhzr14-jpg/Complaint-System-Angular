import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { PriorityDto, CreatePriorityDto, UpdatePriorityDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PrioritiesService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Priorities';

  private cache$: Observable<PriorityDto[]> | null = null;

  /**
   * Retrieves all priorities. Uses in-memory shareReplay cache to respect the backend 5 req/min rate limit.
   * @param forceRefresh When true, bypasses the cache and issues a fresh HTTP request.
   */
  getAll(forceRefresh = false): Observable<PriorityDto[]> {
    if (forceRefresh || !this.cache$) {
      this.cache$ = this.http.get<PriorityDto[]>(`${this.baseUrl}/All`).pipe(
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

  getById(id: number): Observable<PriorityDto> {
    return this.http.get<PriorityDto>(`${this.baseUrl}/GetBy/${id}`);
  }

  create(dto: CreatePriorityDto): Observable<PriorityDto> {
    return this.http.post<PriorityDto>(`${this.baseUrl}/Create`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, dto: UpdatePriorityDto): Observable<PriorityDto> {
    return this.http.put<PriorityDto>(`${this.baseUrl}/Update/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activate`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {}).pipe(
      tap(() => this.clearCache())
    );
  }
}
