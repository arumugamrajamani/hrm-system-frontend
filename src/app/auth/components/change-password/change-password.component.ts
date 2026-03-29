import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services';
import { ToasterService } from '../../../core/services';
import { PasswordStrengthPipe } from '../../../shared/pipes/password-strength.pipe';

function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(value);

  const errors: ValidationErrors = {};

  if (value.length < 8) {
    errors['minlength'] = true;
  }
  if (!hasUpperCase) {
    errors['uppercase'] = true;
  }
  if (!hasNumber) {
    errors['number'] = true;
  }
  if (!hasSpecialChar) {
    errors['specialChar'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers: [PasswordStrengthPipe],
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private toaster = inject(ToasterService);
  private router = inject(Router);
  private passwordStrengthPipe = inject(PasswordStrengthPipe);

  changePasswordForm: FormGroup;
  isLoading = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, passwordValidator]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  get passwordStrength() {
    return this.passwordStrengthPipe.transform(this.f['newPassword']?.value);
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.authApi.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toaster.success('Success', 'Password changed successfully');
          this.router.navigate(['/dashboard']);
        } else {
          this.toaster.error('Error', response.message || 'Failed to change password');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toaster.error('Error', error.error?.message || 'Failed to change password');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
