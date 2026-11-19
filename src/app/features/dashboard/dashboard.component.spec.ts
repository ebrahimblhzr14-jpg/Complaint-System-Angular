import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ComplaintsByStatusDto } from '../../core/models';
import { ThemeService } from '../../core/services/theme.service';

describe('DashboardComponent - Status Color Mapping', () => {
  let component: DashboardComponent;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('isRejectedStatus', () => {
    it('should identify StatusId 4 as rejected', () => {
      expect(component.isRejectedStatus(4, 'مرفوضة')).toBe(true);
      expect(component.isRejectedStatus(4, 'Rejected')).toBe(true);
      expect(component.isRejectedStatus(4, undefined)).toBe(true);
    });

    it('should identify Arabic text containing مرفوض as rejected even without id 4', () => {
      expect(component.isRejectedStatus(99, 'تم رفض الطلب')).toBe(true);
      expect(component.isRejectedStatus(undefined, 'مرفوضة نهائيا')).toBe(true);
    });

    it('should identify English text containing reject as rejected even without id 4', () => {
      expect(component.isRejectedStatus(99, 'Rejected by Admin')).toBe(true);
      expect(component.isRejectedStatus(undefined, 'Auto-Rejected')).toBe(true);
    });

    it('should NOT identify other statuses as rejected', () => {
      expect(component.isRejectedStatus(1, 'جديدة')).toBe(false);
      expect(component.isRejectedStatus(2, 'قيد المعالجة')).toBe(false);
      expect(component.isRejectedStatus(3, 'مغلقة')).toBe(false);
      expect(component.isRejectedStatus(5, 'تم الحل')).toBe(false);
    });
  });

  describe('getStatusColor - Color Consistency & Order Independence', () => {
    const rejectedItem: ComplaintsByStatusDto = { id: 4, name: 'مرفوضة', complaintCount: 5 };
    const newItem: ComplaintsByStatusDto = { id: 1, name: 'جديدة', complaintCount: 12 };
    const inProgressItem: ComplaintsByStatusDto = { id: 2, name: 'قيد المعالجة', complaintCount: 8 };
    const resolvedItem: ComplaintsByStatusDto = { id: 5, name: 'تم الحل', complaintCount: 7 };
    const closedItem: ComplaintsByStatusDto = { id: 3, name: 'مغلقة', complaintCount: 15 };

    it('should assign distinctive red (#B85C55) in Light theme for Rejected', () => {
      const color = component.getStatusColor(rejectedItem, false);
      expect(color).toBe('#B85C55');
    });

    it('should assign glowing coral red (#C87069) in Dark theme for Rejected', () => {
      const color = component.getStatusColor(rejectedItem, true);
      expect(color).toBe('#C87069');
    });

    it('should assign distinct colors for all other statuses in Light mode', () => {
      expect(component.getStatusColor(newItem, false)).toBe('#879477');
      expect(component.getStatusColor(inProgressItem, false)).toBe('#C58A3A');
      expect(component.getStatusColor(resolvedItem, false)).toBe('#54856A');
      expect(component.getStatusColor(closedItem, false)).toBe('#817C72');
    });

    it('should assign distinct colors for all other statuses in Dark mode', () => {
      expect(component.getStatusColor(newItem, true)).toBe('#9BAA8B');
      expect(component.getStatusColor(inProgressItem, true)).toBe('#D69E4F');
      expect(component.getStatusColor(resolvedItem, true)).toBe('#689D80');
      expect(component.getStatusColor(closedItem, true)).toBe('#9B958A');
    });

    it('should keep Rejected color strictly tied to the status, regardless of its position in array', () => {
      // Order A: Rejected at the end
      const listA = [newItem, inProgressItem, closedItem, rejectedItem];
      const colorsA = listA.map((s) => component.getStatusColor(s, false));
      expect(colorsA[3]).toBe('#B85C55');

      // Order B: Rejected at index 0 (first)
      const listB = [rejectedItem, newItem, inProgressItem, closedItem];
      const colorsB = listB.map((s) => component.getStatusColor(s, false));
      expect(colorsB[0]).toBe('#B85C55');
      expect(colorsB[1]).toBe('#879477');

      // Order C: Rejected in the middle
      const listC = [newItem, rejectedItem, closedItem];
      const colorsC = listC.map((s) => component.getStatusColor(s, false));
      expect(colorsC[1]).toBe('#B85C55');
    });
  });
});
