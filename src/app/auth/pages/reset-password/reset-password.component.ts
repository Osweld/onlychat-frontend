import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './reset-password.component.html',
  styles: ``,
  host:{
    class: 'flex flex-col justify-center items-center h-screen w-full',
  }
})
export class ResetPasswordComponent implements OnDestroy {
  loadingResetPassword = signal(false);
  token = signal<string>('');
  authService = inject(AuthService);
  toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router)

  private destroy$ = new Subject<void>();

  constructor() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe({
      next: (params) => {
        this.token.set(params['token']);
        if (!this.token()) {
          this.toastService.error(
            'Token is missing. Please check your email for the reset link.'
          );
          this.router.navigate(['/login']);
        }
      },
    });
  }

  resetPasswordForm = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  resetPasswordFormValidationMessages = {
    password: [
      { type: 'required', message: 'Password is required' },
      {
        type: 'minlength',
        message: 'Password must be at least 8 characters long',
      },
      { type: 'maxlength', message: 'Password cannot exceed 20 characters' },
    ],
    confirmPassword: [
      { type: 'required', message: 'Confirm Password is required' },
      { type: 'passwordMismatch', message: 'Passwords do not match' },
    ],
  };

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      Object.values(this.resetPasswordForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.loadingResetPassword.set(true);
    const { password } = this.resetPasswordForm.value;
    this.authService.resetPassword(this.token(), password!).subscribe({
      next: (data) => {
        this.loadingResetPassword.set(false);
        this.toastService.success(
          'Password reset successfully. You can now log in with your new password.'
        );
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loadingResetPassword.set(false);
        this.toastService.error(error.error.message ||
          'Error resetting password. Verify your token and try again.'
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.loadingResetPassword.set(false);
    this.resetPasswordForm.reset();
    Object.values(this.resetPasswordForm.controls).forEach((control) =>
      control.markAsPristine()
    );

    this.destroy$.next();
    this.destroy$.complete();
  }
}
