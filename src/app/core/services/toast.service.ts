import { Injectable, signal, inject } from '@angular/core';
import { TranslationService } from './translation.service';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  badgeText?: string;
  action?: ToastAction;
  highlightText?: string;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  badgeText?: string;
  action?: ToastAction;
  highlightText?: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private translation = inject(TranslationService);
  toasts = signal<ToastMessage[]>([]);

  show(
    message: string,
    type: ToastType = 'info',
    title?: string,
    duration: number = 4500,
    options?: Partial<ToastOptions>
  ): void {
    // Deduplication check: prevent identical toasts or multiple rate limit toasts from stacking on screen
    const isRateLimit = (title && title.includes('429')) || (message && message.includes('429'));
    const existing = this.toasts().find((t) => {
      if (isRateLimit && ((t.title && t.title.includes('429')) || (t.message && t.message.includes('429')))) {
        return true;
      }
      return t.message === message && t.type === type;
    });
    if (existing) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);

    let defaultBadge = '';
    switch (type) {
      case 'success':
        defaultBadge = this.translation.translate('badgeSuccess');
        break;
      case 'error':
        defaultBadge = this.translation.translate('badgeError');
        break;
      case 'warning':
        defaultBadge = this.translation.translate('badgeWarning');
        break;
      case 'info':
        defaultBadge = this.translation.translate('badgeInfo');
        break;
    }

    const newToast: ToastMessage = {
      id,
      message,
      type,
      title,
      duration,
      badgeText: options?.badgeText || defaultBadge,
      action: options?.action,
      highlightText: options?.highlightText,
      createdAt: Date.now()
    };

    this.toasts.update((current) => {
      // Keep at most 2 toasts active simultaneously to prevent obscuring form inputs or content
      const list = current.length >= 2 ? current.slice(current.length - 1) : current;
      return [...list, newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title?: string, options?: Partial<ToastOptions>): void {
    this.show(message, 'success', title || this.translation.translate('toastSuccess'), 4500, options);
  }

  error(message: string, title?: string, options?: Partial<ToastOptions>): void {
    this.show(message, 'error', title || this.translation.translate('toastError'), 6000, options);
  }

  warning(message: string, title?: string, options?: Partial<ToastOptions>): void {
    this.show(message, 'warning', title || this.translation.translate('toastWarning'), 5000, options);
  }

  info(message: string, title?: string, options?: Partial<ToastOptions>): void {
    this.show(message, 'info', title || this.translation.translate('toastInfo'), 4000, options);
  }

  remove(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
