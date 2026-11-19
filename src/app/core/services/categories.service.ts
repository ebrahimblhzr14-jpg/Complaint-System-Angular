import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Categories';

  private cache$: Observable<CategoryDto[]> | null = null;

  /**
   * Retrieves all categories. Uses in-memory shareReplay cache to respect the backend 5 req/min rate limit.
   * @param forceRefresh When true, bypasses the cache and issues a fresh HTTP request.
   */
  getAll(forceRefresh = false): Observable<CategoryDto[]> {
    if (forceRefresh || !this.cache$) {
      this.cache$ = this.http.get<CategoryDto[]>(`${this.baseUrl}/All`).pipe(
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

  getById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.baseUrl}/FindBy/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.baseUrl, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, dto: UpdateCategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.baseUrl}/Update/${id}`, dto).pipe(
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
