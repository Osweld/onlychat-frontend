import { ToastService } from './../../../shared/services/toast.service';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Error, LoginCredentials } from '../../interfaces/auth.interface';
import { ForgotPasswordDialogComponent } from '../../components/forgot-password-dialog/forgot-password-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ResendAccountActivationDialogComponent } from '../../components/resend-account-activation-dialog/resend-account-activation-dialog.component';

@Component({
  selector: 'app-login-page',
  imports: [
    CardModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    DividerModule,
    MessageModule,
    ReactiveFormsModule,
    ForgotPasswordDialogComponent,
    ResendAccountActivationDialogComponent,
    RouterLink,
  ],
  templateUrl: './login-page.component.html',
  styles: ``,
})
export class LoginPageComponent implements OnDestroy {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(Router);

  private destroy$ = new Subject<void>();

  loginLoading = signal(false);
  showForgotPassword = signal(false);
  showActivateAccount = signal(false);

  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(20),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  loginFormValidationMessages = {
    username: [
      { type: 'required', message: 'Username is required' },
      {
        type: 'minlength',
        message: 'Username must be at least 5 characters long',
      },
      { type: 'maxlength', message: 'Username cannot exceed 20 characters' },
    ],
    password: [
      { type: 'required', message: 'Password is required' },
      {
        type: 'minlength',
        message: 'Password must be at least 8 characters long',
      },
      { type: 'maxlength', message: 'Password cannot exceed 20 characters' },
    ],
  };

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.loginLoading.set(true);

    const credentials: LoginCredentials = {
      username: this.loginForm.get('username')?.value || '',
      password: this.loginForm.get('password')?.value || '',
    };

    this.authService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.loginLoading.set(false);
          this.setTokenLocalStorage(data.token);
          this.setUserLocalStorage(data.username);
          this.setUserIdLocalStorage(data.id);
          this.setExpirationLocalStorage(data.expirationDate);
          if(!this.authService.isTokenExpired()) {
            this.authService.setupTokenRefresh();
          }
          
          this.route.navigate(['/chat']);
        },
        error: (error) => {
          
          const errorMessage: Error = error.error;
          if (errorMessage?.details?.resend) {
            console.error('Login Error:', error);
              this.showActivateAccount.set(true);
              this.toastService.error(
                'Please check your email to activate your account',
                'Account Activation'
              );
              this.loginForm.reset();
          } else {
            this.toastService.error(
              errorMessage.message || 'Server Error',
              'Login Error'
            );
          }
          this.loginLoading.set(false);
        },
      });
  }

  setTokenLocalStorage(token: string) {
    localStorage.setItem('access_token', token);
  }

  setUserLocalStorage(username:string ) {
    localStorage.setItem('username', username);
  }

  setUserIdLocalStorage(id: number) {
    localStorage.setItem('userId', id.toString());
  }

  setExpirationLocalStorage(expiration: Date) {
    localStorage.setItem('expiration', expiration.toString());
  }

  showForgotPasswordDialog() {
    this.showForgotPassword.set(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
