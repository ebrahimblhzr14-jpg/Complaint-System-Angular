import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoriesService } from './categories.service';
import { CategoryDto } from '../models';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpTesting: HttpTestingController;

  const mockCategories: CategoryDto[] = [
    { id: 1, name: 'خدمات إدارية', description: 'تصنيف إداري', isActive: true },
    { id: 2, name: 'خدمات فنية', description: 'تصنيف فني', isActive: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CategoriesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch categories and cache subsequent requests via shareReplay', () => {
    let result1: CategoryDto[] | undefined;
    let result2: CategoryDto[] | undefined;

    // First call triggers HTTP request
    service.getAll().subscribe((data) => (result1 = data));

    const req = httpTesting.expectOne('/api/Categories/All');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);

    expect(result1).toEqual(mockCategories);

    // Second call must reuse cached observable without issuing another HTTP GET
    service.getAll().subscribe((data) => (result2 = data));
    httpTesting.expectNone('/api/Categories/All');

    expect(result2).toEqual(mockCategories);
  });

  it('should bypass cache when forceRefresh=true is specified', () => {
    service.getAll().subscribe();
    const req1 = httpTesting.expectOne('/api/Categories/All');
    req1.flush(mockCategories);

    // Force refresh triggers a second request
    service.getAll(true).subscribe();
    const req2 = httpTesting.expectOne('/api/Categories/All');
    req2.flush(mockCategories);
  });

  it('should clear cache on create category mutation', () => {
    service.getAll().subscribe();
    httpTesting.expectOne('/api/Categories/All').flush(mockCategories);

    // Create a new category
    service.create({ name: 'جديد', description: 'وصف' }).subscribe();
    const postReq = httpTesting.expectOne('/api/Categories');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({ id: 3, name: 'جديد', description: 'وصف', isActive: true });

    // Subsequent getAll must trigger a new HTTP GET
    service.getAll().subscribe();
    httpTesting.expectOne('/api/Categories/All').flush(mockCategories);
  });
});

