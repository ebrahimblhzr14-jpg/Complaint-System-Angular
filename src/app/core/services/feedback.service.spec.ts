import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeedbackService } from './feedback.service';
import { FeedbackDto, CreateFeedbackDto, UpdateFeedbackDto } from '../models';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpTesting: HttpTestingController;

  const mockFeedbackList: FeedbackDto[] = [
    {
      id: 101,
      complaintId: 1,
      userId: 8,
      userName: 'User A',
      rating: 5,
      comment: 'خدمة ممتازة وسريعة جداً',
      createdAt: '2026-11-18T00:00:00Z'
    },
    {
      id: 102,
      complaintId: 1,
      userId: 10,
      userName: 'Admin Reviewer',
      rating: 4,
      comment: 'ملاحظات جيدة وتم إغلاق الشكوى',
      createdAt: '2026-11-18T01:00:00Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FeedbackService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FeedbackService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch feedback collection for a complaint as an array (getByComplaint)', () => {
    let result: FeedbackDto[] | undefined;

    service.getByComplaint(1).subscribe((data) => (result = data));

    const req = httpTesting.expectOne('/api/Feedback/FindBy1');
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedbackList);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result?.length).toBe(2);
    expect(result?.[0].id).toBe(101);
    expect(result?.[1].rating).toBe(4);
  });

  it('should handle empty feedback collection from API', () => {
    let result: FeedbackDto[] | undefined;

    service.getByComplaint(99).subscribe((data) => (result = data));

    const req = httpTesting.expectOne('/api/Feedback/FindBy99');
    expect(req.request.method).toBe('GET');
    req.flush([]);

    expect(result).toBeDefined();
    expect(result?.length).toBe(0);
  });

  it('should fetch single feedback by ID with complaintId query parameter (getById)', () => {
    let result: FeedbackDto | undefined;

    service.getById(1, 101).subscribe((data) => (result = data));

    const req = httpTesting.expectOne('/api/Feedback/FindByFeedID101?complaintId=1');
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedbackList[0]);

    expect(result).toBeDefined();
    expect(result?.id).toBe(101);
    expect(result?.comment).toBe('خدمة ممتازة وسريعة جداً');
  });

  it('should create feedback record and return created object (create)', () => {
    const dto: CreateFeedbackDto = {
      complaintId: 1,
      rating: 5,
      comment: 'تقييم جديد'
    };

    let result: FeedbackDto | undefined;

    service.create(dto).subscribe((data) => (result = data));

    const req = httpTesting.expectOne('/api/Feedback/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush({
      id: 103,
      complaintId: 1,
      userId: 8,
      rating: 5,
      comment: 'تقييم جديد',
      createdAt: '2026-11-18T02:00:00Z'
    });

    expect(result).toBeDefined();
    expect(result?.id).toBe(103);
    expect(result?.rating).toBe(5);
  });

  it('should update feedback record and return updated object (update)', () => {
    const updateDto: UpdateFeedbackDto = {
      rating: 4,
      comment: 'تم تعديل الملاحظة'
    };

    let result: FeedbackDto | undefined;

    service.update(1, 101, updateDto).subscribe((data) => (result = data));

    const req = httpTesting.expectOne('/api/Feedback/Update/101?complaintId=1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);

    req.flush({
      ...mockFeedbackList[0],
      rating: 4,
      comment: 'تم تعديل الملاحظة'
    });

    expect(result).toBeDefined();
    expect(result?.rating).toBe(4);
    expect(result?.comment).toBe('تم تعديل الملاحظة');
  });
});
