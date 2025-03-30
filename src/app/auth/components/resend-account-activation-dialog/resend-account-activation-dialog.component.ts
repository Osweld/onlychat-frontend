import { Component, inject, model, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resend-account-activation-dialog',
  imports: [
    Dialog, 
    ButtonModule, 
    InputTextModule, 
    ReactiveFormsModule, 
    MessageModule 
  ],
  templateUrl: './resend-account-activation-dialog.component.html',
  styles: ``
})
export class ResendAccountActivationDialogComponent {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  
  visible = model<boolean>(false);
  resendEmailLoading = signal(false);
  private destroy$ = new Subject<void>();


  resendEmailForm = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ])
  });

  resendEmailFormValidationMessages = {
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Please enter a valid email address' }
    ]
  };

  closeDialog(): void {
    this.visible.set(false);
    this.resendEmailForm.reset();
  }


  onSubmit(): void {
      if (this.resendEmailForm.invalid) {
        this.resendEmailForm.markAllAsTouched();
        return;
      }
  
      const email = this.resendEmailForm.get('email')?.value || '';
      this.resendEmailLoading.set(true);
      
      this.authService.resendActivationEmail(email)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.resendEmailLoading.set(false))
        )
        .subscribe({
          next: () => {
            this.toastService.success("Account activation email sent to your email address");
            this.resendEmailForm.reset();
            this.closeDialog();
            this.router.navigate(['/login']);
          },
          error: (error) => {
            const errorMessage = error.error?.message || "An error occurred";
            this.toastService.error(errorMessage);
          }
        });
    }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
