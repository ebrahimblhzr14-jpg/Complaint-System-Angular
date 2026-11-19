import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComplaintHistoryDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/ComplaintHistory';

  // SuperAdmin only
  getByComplaint(complaintId: number): Observable<ComplaintHistoryDto[]> {
    return this.http.get<ComplaintHistoryDto[]>(`${this.baseUrl}?complaintId=${complaintId}`);
  }

  // SuperAdmin only
  getById(complaintId: number, historyId: number): Observable<ComplaintHistoryDto> {
    return this.http.get<ComplaintHistoryDto>(
      `${this.baseUrl}/${historyId}?complaintId=${complaintId}`
    );
  }
}

