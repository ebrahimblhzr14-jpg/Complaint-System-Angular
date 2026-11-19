import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedbackDto, CreateFeedbackDto, UpdateFeedbackDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Feedback';

  /**
   * Retrieves all feedback records for a specific complaint.
   * Backend endpoint: GET /api/Feedback/FindBy{complaintId} returns IEnumerable<FeedbackDto>
   */
  getByComplaint(complaintId: number): Observable<FeedbackDto[]> {
    return this.http.get<FeedbackDto[]>(`${this.baseUrl}/FindBy${complaintId}`);
  }

  /**
   * Retrieves a single feedback record by its feedback ID and complaint ID.
   * Backend endpoint: GET /api/Feedback/FindByFeedID{feedbackId}?complaintId={complaintId}
   */
  getById(complaintId: number, feedbackId: number): Observable<FeedbackDto> {
    return this.http.get<FeedbackDto>(
      `${this.baseUrl}/FindByFeedID${feedbackId}?complaintId=${complaintId}`
    );
  }

  /**
   * Submits a new feedback record.
   * Backend endpoint: POST /api/Feedback/create returns CreatedAtAction with single FeedbackDto
   */
  create(dto: CreateFeedbackDto): Observable<FeedbackDto> {
    return this.http.post<FeedbackDto>(`${this.baseUrl}/create`, dto);
  }

  /**
   * Updates an existing feedback record.
   * Backend endpoint: PUT /api/Feedback/Update/{feedbackId}?complaintId={complaintId}
   */
  update(
    complaintId: number,
    feedbackId: number,
    dto: UpdateFeedbackDto
  ): Observable<FeedbackDto> {
    return this.http.put<FeedbackDto>(
      `${this.baseUrl}/Update/${feedbackId}?complaintId=${complaintId}`,
      dto
    );
  }
}
