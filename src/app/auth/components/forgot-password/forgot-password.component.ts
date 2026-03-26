import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services';
import { ToasterService, ModalService } from '../../../core/services';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private toaster = inject(ToasterService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  forgotForm: FormGroup;
  step = signal<'email' | 'otp'>('email');
  email = signal('');
  isLoading = signal(false);
  resendCooldown = signal(0);
  otpValues = signal<string[]>(['', '', '', '', '', '']);
  otpStatus = signal<Array<'correct' | 'wrong' | ''>>(['', '', '', '', '', '']);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  submitEmail(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.email.set(this.forgotForm.value.email);

    this.authApi.requestPasswordReset(this.email()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.step.set('otp');
          this.toaster.success('OTP Sent', 'Check your email for the verification code');
        } else {
          this.modalService.showError('Error', response.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.modalService.showError('Error', 'Failed to send OTP. Please try again.');
      }
    });
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    const newValues = [...this.otpValues()];
    const newStatus = [...this.otpStatus()];

    if (value.length > 0) {
      newValues[index] = value[0];
      input.value = value[0];
      newStatus[index] = 'correct';

      this.otpValues.set(newValues);
      this.otpStatus.set(newStatus);

      const otp = newValues.join('');
      if (otp.length === 6 && !newValues.includes('')) {
        this.verifyOtp(otp);
      }
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const newValues = [...this.otpValues()];
      const newStatus = [...this.otpStatus()];

      if (newValues[index] === '' && index > 0) {
        newValues[index - 1] = '';
        newStatus[index - 1] = '';
        this.otpValues.set(newValues);
        this.otpStatus.set(newStatus);
      } else {
        newValues[index] = '';
        newStatus[index] = '';
        this.otpValues.set(newValues);
        this.otpStatus.set(newStatus);
      }
    }
  }

  private verifyOtp(otp: string): void {
    this.isLoading.set(true);

    this.authApi.verifyOtp(this.email(), otp).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.email(), token: response.data?.token }
          });
        } else {
          this.markAllWrong();
          this.modalService.showError('Verification Failed', response.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.markAllWrong();
        this.modalService.showError('Verification Failed', 'Invalid or expired OTP');
      }
    });
  }

  private markAllWrong(): void {
    const newStatus: Array<'correct' | 'wrong' | ''> = ['wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong'];
    this.otpStatus.set(newStatus);

    setTimeout(() => {
      this.otpValues.set(['', '', '', '', '', '']);
      this.otpStatus.set(['', '', '', '', '', '']);
    }, 1000);
  }

  resendOtp(): void {
    if (this.resendCooldown() > 0) return;

    this.isLoading.set(true);

    this.authApi.resendOtp(this.email()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toaster.success('OTP Sent', 'A new OTP has been sent to your email');
          this.startResendCooldown();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.modalService.showError('Error', 'Failed to resend OTP');
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown.set(60);
    const interval = setInterval(() => {
      this.resendCooldown.update(v => {
        if (v <= 1) {
          clearInterval(interval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  goBack(): void {
    if (this.step() === 'otp') {
      this.step.set('email');
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
