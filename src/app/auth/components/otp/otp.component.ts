import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../services';
import { ToasterService, ModalService } from '../../../core/services';

@Component({
  selector: 'app-otp',
  standalone: false,
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private toaster = inject(ToasterService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  email = signal('');
  isLoading = signal(false);
  resendCooldown = signal(0);
  otpValues = signal<string[]>(['', '', '', '', '', '']);
  otpStatus = signal<Array<'correct' | 'wrong' | ''>>(['', '', '', '', '', '']);

  ngAfterViewInit(): void {
    this.email.set(this.route.snapshot.queryParams['email'] || '');
    if (!this.email()) {
      this.router.navigate(['/auth/login']);
    }
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    const newValues = [...this.otpValues()];
    const newStatus = [...this.otpStatus()];

    if (value.length > 0) {
      newValues[index] = value[0];
      input.value = value[0];

      this.validateDigit(index, value[0]);
      newStatus[index] = '';

      if (index < 5) {
        setTimeout(() => {
          const inputs = this.otpInputs.toArray();
          inputs[index + 1].nativeElement.focus();
        }, 10);
      }

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

      if (newValues[index] === '') {
        if (index > 0) {
          newValues[index - 1] = '';
          newStatus[index - 1] = '';
          this.otpValues.set(newValues);
          this.otpStatus.set(newStatus);

          setTimeout(() => {
            const inputs = this.otpInputs.toArray();
            inputs[index - 1].nativeElement.focus();
          }, 10);
        }
      } else {
        newValues[index] = '';
        newStatus[index] = '';
        this.otpValues.set(newValues);
        this.otpStatus.set(newStatus);
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';

    if (paste.length > 0) {
      const newValues = [...this.otpValues()];
      const newStatus = [...this.otpStatus()];

      for (let i = 0; i < paste.length; i++) {
        newValues[i] = paste[i];
        newStatus[i] = '';
      }

      this.otpValues.set(newValues);
      this.otpStatus.set(newStatus);

      const inputs = this.otpInputs.toArray();
      inputs.forEach((input, i) => {
        input.nativeElement.value = newValues[i] || '';
      });

      const lastIndex = Math.min(paste.length, 6) - 1;
      if (lastIndex >= 0) {
        setTimeout(() => {
          inputs[lastIndex].nativeElement.focus();
        }, 10);
      }

      if (paste.length === 6) {
        setTimeout(() => this.verifyOtp(paste), 100);
      }
    }
  }

  private validateDigit(index: number, digit: string): void {
    const newStatus = [...this.otpStatus()];
    newStatus[index] = 'correct';
    this.otpStatus.set(newStatus);

    setTimeout(() => {
      const currentStatus = [...this.otpStatus()];
      if (currentStatus[index] === 'correct') {
        currentStatus[index] = '';
        this.otpStatus.set(currentStatus);
      }
    }, 500);
  }

  private verifyOtp(otp: string): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.authApi.verifyOtp(this.email(), otp).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toaster.success('OTP Verified', 'Redirecting...');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
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
      const newValues = ['', '', '', '', '', ''];
      this.otpValues.set(newValues);

      const inputs = this.otpInputs.toArray();
      inputs.forEach((input, i) => {
        input.nativeElement.value = '';
      });

      this.otpStatus.set(['', '', '', '', '', '']);
      inputs[0].nativeElement.focus();
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
        } else {
          this.modalService.showError('Error', response.message);
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
    this.router.navigate(['/auth/login']);
  }
}
