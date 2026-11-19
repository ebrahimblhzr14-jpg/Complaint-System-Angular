import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/ComplaintComments';

  getByComplaint(complaintId: number): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${this.baseUrl}/GetAll/${complaintId}`);
  }

  getById(commentId: number): Observable<CommentDto> {
    return this.http.get<CommentDto>(`${this.baseUrl}/GetByID/${commentId}`);
  }

  create(dto: CreateCommentDto): Observable<CommentDto> {
    return this.http.post<CommentDto>(`${this.baseUrl}/Create`, dto);
  }

  update(commentId: number, dto: UpdateCommentDto): Observable<CommentDto> {
    return this.http.put<CommentDto>(`${this.baseUrl}/Update/${commentId}`, dto);
  }

  // Note: Backend requires complaintId as query parameter!
  delete(commentId: number, complaintId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${commentId}?complaintId=${complaintId}`);
  }
}

