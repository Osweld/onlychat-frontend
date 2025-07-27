import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    const confirmPasswordControl = formGroup.get('confirmPassword');
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
      const errors = { ...confirmPasswordControl.errors };
      delete errors['passwordMismatch'];
      confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  };
}