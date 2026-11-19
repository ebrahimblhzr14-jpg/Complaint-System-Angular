import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  it('should default to Arabic language and RTL direction', () => {
    expect(service.currentLang()).toBe('ar');
    expect(service.direction()).toBe('rtl');
  });

  it('should toggle to English language and LTR direction', () => {
    service.toggleLanguage();
    expect(service.currentLang()).toBe('en');
    expect(service.direction()).toBe('ltr');
  });

  it('should translate dictionary keys accurately in both languages', () => {
    service.setLanguage('ar');
    expect(service.translate('appName')).toBe('نظام إدارة الشكاوى');

    service.setLanguage('en');
    expect(service.translate('appName')).toBe('Complaint Management System');
  });

  it('should return the key if translation is missing', () => {
    expect(service.translate('non_existing_key_xyz')).toBe('non_existing_key_xyz');
  });
});

