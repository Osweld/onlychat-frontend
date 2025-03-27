import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from './../../services/auth.service';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { SignupCredentials } from '../../interfaces/auth.interface';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    RouterLink
  ],
  templateUrl: './register-page.component.html',
  styles: ``,
})
export class RegisterPageComponent implements OnDestroy{
  authService = inject(AuthService);
  toastService = inject(ToastService);

  private destroy$ = new Subject<void>();

  registerLoading = signal(false);

  registerForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(50),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  registerFormValidationMessages = {
    username: [
      { type: 'required', message: 'Username is required' },
      {
        type: 'minlength',
        message: 'Username must be at least 5 characters long',
      },
      { type: 'maxlength', message: 'Username cannot exceed 20 characters' },
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      {
        type: 'minlength',
        message: 'Email must be at least 10 characters long',
      },
      { type: 'maxlength', message: 'Email cannot exceed 50 characters' },
      { type: 'pattern', message: 'Please enter a valid email address' },
    ],
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
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.registerLoading.set(true);

    const credentials: SignupCredentials = {
      username: this.registerForm.get('username')?.value || '',
      email: this.registerForm.get('email')?.value || '',
      password: this.registerForm.get('password')?.value || '',
    };

    this.authService.register(credentials).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.registerLoading.set(false);
        this.toastService.success(
          'User registered successfully, check your email to verify your account',
          'Register Success'
        );
        this.registerForm.reset();
      },
      error: (error) => {
        console.error(error);
        this.toastService.error(
          error.error.message || 'Server Error',
          'Register Error'
        );
        this.registerLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
