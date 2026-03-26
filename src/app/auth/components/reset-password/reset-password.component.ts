import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../services';
import { ToasterService, ModalService } from '../../../core/services';
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
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [PasswordStrengthPipe]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private toaster = inject(ToasterService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private passwordStrengthPipe = inject(PasswordStrengthPipe);

  resetForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  email = '';
  token = '';

  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.email || !this.token) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  get f() {
    return this.resetForm.controls;
  }

  get passwordStrength() {
    return this.passwordStrengthPipe.transform(this.resetForm.get('password')?.value);
  }

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authApi.resetPassword(this.token, this.resetForm.value.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toaster.success('Password Reset', 'Your password has been changed successfully');
          this.router.navigate(['/auth/login']);
        } else {
          this.modalService.showError('Error', response.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.modalService.showError('Error', 'Failed to reset password. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}
