import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ComplaintDto,
  CreateComplaintDto,
  UpdateComplaintDto,
  CreateAssignmentDto,
  UpdateComplaintStatusDto
} from '../models';
import { DashboardService } from './dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintsService {
  private http = inject(HttpClient);
  private dashboardService = inject(DashboardService);
  private readonly baseUrl = '/api/Complaints';

  // SuperAdmin only
  getAll(): Observable<ComplaintDto[]> {
    return this.http.get<ComplaintDto[]>(`${this.baseUrl}/All`);
  }

  // Owner or SuperAdmin
  getByUserId(userId: number): Observable<ComplaintDto[]> {
    return this.http.get<ComplaintDto[]>(`${this.baseUrl}/AllByUserID/${userId}`);
  }

  // Owner, Admin, or SuperAdmin
  getById(id: number): Observable<ComplaintDto> {
    return this.http.get<ComplaintDto>(`${this.baseUrl}/FindBy/${id}`);
  }

  // User, Admin, SuperAdmin
  create(dto: CreateComplaintDto): Observable<ComplaintDto> {
    return this.http.post<ComplaintDto>(`${this.baseUrl}/Create`, dto).pipe(
      tap(() => this.dashboardService.clearCache())
    );
  }

  // Owner or SuperAdmin
  update(id: number, dto: UpdateComplaintDto): Observable<ComplaintDto> {
    return this.http.put<ComplaintDto>(`${this.baseUrl}/Update/${id}`, dto).pipe(
      tap(() => this.dashboardService.clearCache())
    );
  }

  // SuperAdmin only
  assign(dto: CreateAssignmentDto): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/assign`, dto).pipe(
      tap(() => this.dashboardService.clearCache())
    );
  }

  // Admin or SuperAdmin
  changeStatus(id: number, statusId: number): Observable<void> {
    const payload: UpdateComplaintStatusDto = { statusId };
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, payload).pipe(
      tap(() => this.dashboardService.clearCache())
    );
  }

  // Owner (New status only) or Admin/SuperAdmin
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.dashboardService.clearCache())
    );
  }
}

