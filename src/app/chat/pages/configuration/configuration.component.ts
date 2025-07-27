import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-configuration',
  imports: [RouterLink,ButtonModule,CardModule,ReactiveFormsModule,MessageModule,
      InputTextModule,
      PasswordModule,],
  templateUrl: './configuration.component.html',
  styles: ``
})
export class ConfigurationComponent {

  loadingChangePassword = signal(false);

    

  private destroy$ = new Subject<void>();

  authService = inject(AuthService);
  toastService = inject(ToastService);




  changePasswordForm = new FormGroup(
    {
      oldPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
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


  changePasswordFormValidationMessages = {
    oldPassword: [
      { type: 'required', message: 'Old password is required' },
      {
        type: 'minlength',
        message: 'Old password must be at least 8 characters long',
      },
      { type: 'maxlength', message: 'Old password cannot exceed 20 characters' },
    ],
    password: [
      { type: 'required', message: 'New password is required' },
      {
        type: 'minlength',
        message: 'New password must be at least 8 characters long',
      },
      { type: 'maxlength', message: 'New password cannot exceed 20 characters' },
    ],
    confirmPassword: [
      { type: 'required', message: 'Confirm Password is required' },
      { type: 'passwordMismatch', message: 'Passwords do not match' },
    ],
  };

  onSubmit() {

    if (this.changePasswordForm.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }


    this.loadingChangePassword.set(true);
    const { oldPassword, password } = this.changePasswordForm.value;
    this.authService
      .changePassword({ oldPassword: oldPassword!, newPassword: password! })
      .subscribe({
        next: (res) => {
          this.loadingChangePassword.set(false);
          this.toastService.success('Password changed successfully');
          this.changePasswordForm.reset();
        },
        error: (err) => {
          this.loadingChangePassword.set(false);
          this.toastService.error(err.error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.loadingChangePassword.set(false);
    this.changePasswordForm.reset();
    Object.values(this.changePasswordForm.controls).forEach((control) =>
      control.markAsPristine()
    );

    this.destroy$.next();
    this.destroy$.complete();
  }

}
