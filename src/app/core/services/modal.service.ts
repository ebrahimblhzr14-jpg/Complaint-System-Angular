import { Injectable, signal, inject } from '@angular/core';
import { TranslationService } from './translation.service';

export type DialogType = 'danger' | 'warning' | 'info' | 'success' | 'action';

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: DialogType;
  badgeText?: string;
  highlightText?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export interface AttachmentPreviewOptions {
  imageUrl: string;
  fileName?: string;
  fileSize?: string;
  canDelete?: boolean;
  onDownload?: () => void;
  onDelete?: () => void;
}

export interface LoadingOptions {
  title?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private translation = inject(TranslationService);

  // Confirmation Dialog Signal
  isOpen = signal<boolean>(false);
  options = signal<ConfirmOptions>({
    title: '',
    message: '',
    type: 'action',
    confirmText: '',
    cancelText: '',
    isDanger: false
  });

  // Attachment Preview Dialog Signal
  isPreviewOpen = signal<boolean>(false);
  previewOptions = signal<AttachmentPreviewOptions>({
    imageUrl: '',
    fileName: '',
    fileSize: '',
    canDelete: false
  });
  private previewDeleteCallback?: () => void;

  // Global Progress Loading Dialog Signal
  isLoadingOpen = signal<boolean>(false);
  loadingOptions = signal<LoadingOptions>({
    title: '',
    description: ''
  });

  private resolveConfirmPromise?: (value: boolean) => void;

  /**
   * Opens the confirmation dialog styled according to Popups & Dialogs design.
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    const isDanger = options.isDanger ?? (options.type === 'danger');
    const type = options.type || (isDanger ? 'danger' : 'action');

    const defaultBadge = isDanger
      ? this.translation.translate('badgeSensitiveAction')
      : (type === 'warning'
          ? this.translation.translate('badgeWarning')
          : (type === 'success'
              ? this.translation.translate('badgeSuccess')
              : this.translation.translate('badgeConfirmAction')));

    this.options.set({
      badgeText: options.badgeText || defaultBadge,
      confirmText: options.confirmText || (isDanger ? this.translation.translate('confirmDeleteBtn') : this.translation.translate('confirm')),
      cancelText: options.cancelText || this.translation.translate('cancelActionBtn'),
      isDanger,
      type,
      ...options
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveConfirmPromise = resolve;
    });
  }

  handleConfirm(): void {
    this.isOpen.set(false);
    this.resolveConfirmPromise?.(true);
  }

  handleCancel(): void {
    this.isOpen.set(false);
    this.resolveConfirmPromise?.(false);
  }

  /**
   * Opens the attachment preview dialog (Card 9 style).
   */
  openAttachmentPreview(options: AttachmentPreviewOptions, onDelete?: () => void): void {
    this.previewOptions.set({
      imageUrl: options.imageUrl,
      fileName: options.fileName || 'attachment.png',
      fileSize: options.fileSize || 'Image • PNG',
      canDelete: options.canDelete ?? false
    });
    this.previewDeleteCallback = onDelete;
    this.isPreviewOpen.set(true);
  }

  closeAttachmentPreview(): void {
    this.isPreviewOpen.set(false);
  }

  handlePreviewDelete(): void {
    this.closeAttachmentPreview();
    this.previewDeleteCallback?.();
  }

  /**
   * Shows the global loading progress dialog (Card 7 style).
   */
  showLoading(title?: string, description?: string): void {
    this.loadingOptions.set({
      title: title || this.translation.translate('loadingSyncTitle'),
      description: description || this.translation.translate('loadingSyncDesc')
    });
    this.isLoadingOpen.set(true);
  }

  hideLoading(): void {
    this.isLoadingOpen.set(false);
  }
}
