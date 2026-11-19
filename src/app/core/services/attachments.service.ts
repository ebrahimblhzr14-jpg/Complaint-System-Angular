import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadAttachmentResponse {
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttachmentsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Attachment';

  // Backend route typo: Uploade
  upload(complaintId: number, file: File): Observable<UploadAttachmentResponse> {
    const formData = new FormData();
    formData.append('imageFile', file);
    return this.http.post<UploadAttachmentResponse>(
      `${this.baseUrl}/Uploade/${complaintId}`,
      formData
    );
  }

  // Returns URL string of first attached image
  getImagePath(complaintId: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/GetImagePath/${complaintId}`, {
      responseType: 'text'
    });
  }
}

