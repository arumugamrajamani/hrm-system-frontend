import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../services';
import { AuthService, ToasterService, ModalService } from '../../../core/services';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private authService = inject(AuthService);
  private toaster = inject(ToasterService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  returnUrl = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authApi.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          const { user, token } = response.data;
          this.authService.login(token, user);
          this.toaster.success('Login Successful', `Welcome back, ${user.firstName || user.username}!`);
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.modalService.showError('Login Failed', response.message);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'An unexpected error occurred';
        this.modalService.showError('Login Failed', message);
      }
    });
  }
}
