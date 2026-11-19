import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ComplaintDetailComponent } from './complaint-detail.component';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ComplaintsService } from '../../../core/services/complaints.service';
import { StatusesService } from '../../../core/services/statuses.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FeedbackDto, ComplaintDto } from '../../../core/models';

describe('ComplaintDetailComponent - Feedback & Quality Enhancements', () => {
  let component: ComplaintDetailComponent;
  let fixture: ComponentFixture<ComplaintDetailComponent>;
  let feedbackService: FeedbackService;
  let toastService: ToastService;
  let authService: AuthService;

  const mockComplaint: ComplaintDto = {
    id: 1,
    userId: 8,
    userName: 'User A',
    categoryId: 1,
    categoryName: 'خدمات فنية',
    statusId: 2,
    statusName: 'قيد المعالجة',
    priorityId: 1,
    priorityName: 'منخفضة',
    title: 'شكوى فنية تجريبية',
    description: 'تفاصيل الشكوى الفنية',
    createdAt: '2026-11-18T00:00:00Z'
  };

  const mockFeedbackList: FeedbackDto[] = [
    {
      id: 201,
      complaintId: 1,
      userId: 8,
      userName: 'User A',
      rating: 5,
      comment: 'خدمة ممتازة وسريعة',
      createdAt: '2026-11-18T01:00:00Z'
    },
    {
      id: 202,
      complaintId: 1,
      userId: 10,
      userName: 'Admin Supervisor',
      rating: 4,
      comment: 'تم الفحص والمتابعة',
      createdAt: '2026-11-18T02:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    feedbackService = TestBed.inject(FeedbackService);
    toastService = TestBed.inject(ToastService);
    authService = TestBed.inject(AuthService);

    // Mock complaints service getById
    const complaintsService = TestBed.inject(ComplaintsService);
    vi.spyOn(complaintsService, 'getById').mockReturnValue(of(mockComplaint));

    // Mock statuses service getAll
    const statusesService = TestBed.inject(StatusesService);
    vi.spyOn(statusesService, 'getAll').mockReturnValue(of([
      { id: 1, name: 'جديدة' },
      { id: 2, name: 'قيد المعالجة' },
      { id: 5, name: 'تم الحل' },
      { id: 3, name: 'مغلقة' }
    ]));

    fixture = TestBed.createComponent(ComplaintDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize component and require explicit rating selection (not default to 5)', () => {
    expect(component).toBeTruthy();
    expect(component.feedbackForm.value.rating).toBeNull();
    expect(component.feedbackForm.valid).toBe(false);
  });

  it('should load feedback collection as an array and handle multiple records', () => {
    vi.spyOn(feedbackService, 'getByComplaint').mockReturnValue(of(mockFeedbackList));

    component.switchTab('feedback');

    expect(component.feedback().length).toBe(2);
    expect(component.feedback()[0].id).toBe(201);
    expect(component.feedback()[0].rating).toBe(5);
    expect(component.feedback()[1].id).toBe(202);
    expect(component.feedback()[1].rating).toBe(4);
    expect(component.isLoadingFeedback()).toBe(false);
  });

  it('should handle empty feedback collection without throwing errors', () => {
    vi.spyOn(feedbackService, 'getByComplaint').mockReturnValue(of([]));

    component.switchTab('feedback');

    expect(component.feedback()).toEqual([]);
    expect(component.feedback().length).toBe(0);
    expect(component.isLoadingFeedback()).toBe(false);
  });

  it('should submit new feedback, validate rating, and refresh collection', () => {
    const createSpy = vi.spyOn(feedbackService, 'create').mockReturnValue(of({
      id: 203,
      complaintId: 1,
      userId: 8,
      rating: 5,
      comment: 'تقييم جديد ممتاز',
      createdAt: '2026-11-18T03:00:00Z'
    }));

    const getSpy = vi.spyOn(feedbackService, 'getByComplaint').mockReturnValue(of(mockFeedbackList));

    component.feedbackForm.patchValue({
      rating: 5,
      comment: 'تقييم جديد ممتاز'
    });
    expect(component.feedbackForm.valid).toBe(true);

    component.onSubmitFeedback();

    expect(createSpy).toHaveBeenCalledWith({
      complaintId: 1,
      rating: 5,
      comment: 'تقييم جديد ممتاز'
    });
    expect(getSpy).toHaveBeenCalled();
  });

  it('should allow editing feedback when current user is the author and complaint owner', () => {
    authService.currentUser.set({
      id: 8,
      name: 'User A',
      email: 'user_a@test.com',
      role: 'User',
      roleId: 1
    });

    // Item created by User A (id 8) on User A's complaint (userId 8)
    const canEditOwn = component.canEditFeedback(mockFeedbackList[0]);
    expect(canEditOwn).toBe(true);

    // Item created by Admin (id 10) -> User A cannot edit
    const canEditOther = component.canEditFeedback(mockFeedbackList[1]);
    expect(canEditOther).toBe(false);
  });

  it('should allow SuperAdmin to edit feedback on complaints', () => {
    authService.currentUser.set({
      id: 11,
      name: 'SuperAdmin',
      email: 'superadmin@test.com',
      role: 'SuperAdmin',
      roleId: 3
    });

    const mockAdminFeedback: FeedbackDto = {
      id: 205,
      complaintId: 1,
      userId: 11,
      rating: 4,
      comment: 'ملاحظة المشرف العام',
      createdAt: '2026-11-18T04:00:00Z'
    };

    expect(component.canEditFeedback(mockAdminFeedback)).toBe(true);
  });

  it('should submit feedback edit via update() and refresh collection', () => {
    const updateSpy = vi.spyOn(feedbackService, 'update').mockReturnValue(of({
      id: 201,
      complaintId: 1,
      userId: 8,
      rating: 4,
      comment: 'تم تحديث الملاحظة',
      createdAt: '2026-11-18T01:00:00Z'
    }));

    const getSpy = vi.spyOn(feedbackService, 'getByComplaint').mockReturnValue(of(mockFeedbackList));

    component.startEditFeedback(mockFeedbackList[0]);
    expect(component.editingFeedbackId()).toBe(201);
    expect(component.editFeedbackForm.value.rating).toBe(5);

    component.editFeedbackForm.patchValue({
      rating: 4,
      comment: 'تم تحديث الملاحظة'
    });

    component.onUpdateFeedback(201);

    expect(updateSpy).toHaveBeenCalledWith(1, 201, {
      rating: 4,
      comment: 'تم تحديث الملاحظة'
    });
    expect(getSpy).toHaveBeenCalled();
    expect(component.editingFeedbackId()).toBeNull();
  });

  it('should handle feedback loading error gracefully with retry support', () => {
    vi.spyOn(feedbackService, 'getByComplaint').mockReturnValue(throwError(() => ({
      status: 500,
      error: { message: 'Database query timeout' }
    })));

    component.switchTab('feedback');

    expect(component.isLoadingFeedback()).toBe(false);
    expect(component.feedbackLoadError()).toBe('Database query timeout');

    // Retry
    const retrySpy = vi.spyOn(feedbackService, 'getByComplaint').mockReturnValue(of(mockFeedbackList));
    component.loadFeedback(true);

    expect(retrySpy).toHaveBeenCalled();
    expect(component.feedbackLoadError()).toBeNull();
  });
});
