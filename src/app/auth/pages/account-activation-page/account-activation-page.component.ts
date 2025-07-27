import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Error } from '../../interfaces/auth.interface';
import { ResendAccountActivationDialogComponent } from '../../components/resend-account-activation-dialog/resend-account-activation-dialog.component';

@Component({
  selector: 'app-account-activation-page',
  imports: [
    CardModule,
    ButtonModule,
    RouterLink,
    CommonModule,
    ProgressSpinnerModule,
    ResendAccountActivationDialogComponent,
  ],
  templateUrl: './account-activation-page.component.html',
  styles: ``,
})
export class AccountActivationPageComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  showResendActivation = signal(false);

  private destroy$ = new Subject<void>();

  activationState = signal<'loading' | 'success' | 'error'>('loading');

  constructor() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe({
      next: (params) => {
        const token = params['token'];
        if (!token) {
          this.router.navigate(['/login']);
        }
        this.authService.activateAccount(token).subscribe({
          next: () => {
            this.activationState.set('success');
          },
          error: (error) => {
            this.activationState.set('error');
            const errorMessage: Error = error.error;
            if (errorMessage.details.resend) { 
              
              this.showResendActivation.set(true);
            }
            
          },
        });
      },
      error: (error) => {
        this.activationState.set('error');
      },
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
