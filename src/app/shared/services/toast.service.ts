import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  show(
    severity: ToastSeverity,
    summary: string,
    detail: string,
    life: number = 3000,
    sticky: boolean = false
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life,
      sticky,
    });
  }

  success(message: string, title: string = 'Success'): void {
    this.show('success', title, message);
  }

  info(message: string, title: string = 'Information'): void {
    this.show('info', title, message);
  }

  warn(message: string, title: string = 'Warning'): void {
    this.show('warn', title, message);
  }

  error(message: string, title: string = 'Error'): void {
    this.show('error', title, message);
  }

  clear(): void {
    this.messageService.clear();
  }
}
