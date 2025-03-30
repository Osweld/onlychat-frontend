import { Component, inject, model, signal, OnDestroy } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [
    Dialog,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    MessageModule,
  ],
  templateUrl: './forgot-password-dialog.component.html',
  styles: ``,
})
export class ForgotPasswordDialogComponent implements OnDestroy {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  visible = model<boolean>(false);
  forgotPasswordLoading = signal(false);
  private destroy$ = new Subject<void>();

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
    ]),
  });

  forgotPasswordFormValidationMessages = {
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Please enter a valid email address' },
    ],
  };

  closeDialog(): void {
    this.visible.set(false);
    this.forgotPasswordForm.reset();
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value || '';
    this.forgotPasswordLoading.set(true);

    this.authService
      .forgotPassword(email)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.forgotPasswordLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'A new activation link has been sent to your email',
            'Check Your Inbox'
          );
          this.forgotPasswordForm.reset();
          this.closeDialog();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'An error occurred';
          this.toastService.error(errorMessage);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
