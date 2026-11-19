import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: any, ...args: any[]): string {
    if (key === null || key === undefined) return '';

    // Specialized system-defined mappings via args
    if (args.length > 0) {
      const type = args[0];
      if (type === 'status') {
        const id = typeof key === 'number' ? key : parseInt(key, 10);
        return this.translationService.translateStatus(isNaN(id) ? undefined : id, args[1]);
      }
      if (type === 'priority') {
        const id = typeof key === 'number' ? key : parseInt(key, 10);
        return this.translationService.translatePriority(isNaN(id) ? undefined : id, args[1], args[2]);
      }
      if (type === 'category') {
        const id = typeof key === 'number' ? key : parseInt(key, 10);
        return this.translationService.translateCategory(isNaN(id) ? undefined : id, args[1]);
      }
      if (type === 'role') {
        return this.translationService.translateRole(String(key));
      }
    }

    return this.translationService.translate(String(key));
  }
}
