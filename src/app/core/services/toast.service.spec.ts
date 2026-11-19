import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast message to the signal', () => {
    service.info('Test notification');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Test notification');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should deduplicate identical toast messages to prevent flooding', () => {
    service.warning('تم تجاوز الحد الأقصى للطلبات المسموحة مؤقتاً.');
    service.warning('تم تجاوز الحد الأقصى للطلبات المسموحة مؤقتاً.');
    service.warning('تم تجاوز الحد الأقصى للطلبات المسموحة مؤقتاً.');

    expect(service.toasts().length).toBe(1);
  });

  it('should allow different toast messages', () => {
    service.warning('Message A');
    service.warning('Message B');

    expect(service.toasts().length).toBe(2);
  });

  it('should remove a toast message by id', () => {
    service.success('Operation succeeded');
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should clear all toasts', () => {
    service.info('Msg 1');
    service.info('Msg 2');
    service.clear();
    expect(service.toasts().length).toBe(0);
  });
});

