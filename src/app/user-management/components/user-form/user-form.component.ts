import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserApiService } from '../../services';
import { User } from '../../../core/models';
import { ToasterService, ModalService } from '../../../core/services';
import { PasswordStrengthPipe } from '../../../shared/pipes/password-strength.pipe';
import { debounceTime, map, catchError, of } from 'rxjs';

function mobileValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(control.value) ? null : { invalidMobile: true };
}

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [PasswordStrengthPipe]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userApi = inject(UserApiService);
  private toaster = inject(ToasterService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private passwordStrengthPipe = inject(PasswordStrengthPipe);

  userForm!: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  userId = signal<number | null>(null);
  showPassword = signal(false);

  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'User' }
  ];

  statuses = ['active', 'inactive', 'pending'];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator()]],
      mobile: ['', [Validators.required, mobileValidator], [this.mobileAsyncValidator()]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', this.isEditMode() ? [] : [Validators.required]],
      firstName: [''],
      lastName: [''],
      roleId: ['', Validators.required],
      status: ['active', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(+id);

      this.userForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator(this.userId()!)]],
        mobile: ['', [Validators.required, mobileValidator], [this.mobileAsyncValidator(this.userId()!)]],
        firstName: [''],
        lastName: [''],
        roleId: ['', Validators.required],
        status: ['active', Validators.required]
      });

      this.loadUser(id);
    }
  }

  private loadUser(id: number): void {
    this.isLoading.set(true);

    this.userApi.getUser(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          const user = response.data;
          this.userForm.patchValue({
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            roleId: user.role?.id,
            status: user.status || 'active'
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toaster.error('Error', 'Failed to load user data');
        this.router.navigate(['/user-management']);
      }
    });
  }

  private emailAsyncValidator(excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.errors?.['email']) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        map(() => control.value),
        map((email) => this.userApi.checkEmailUnique(email, excludeId)),
        map((request) => request),
        catchError(() => of(null))
      );
    };
  }

  private mobileAsyncValidator(excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.errors?.['invalidMobile']) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        map(() => control.value),
        map((mobile) => this.userApi.checkMobileUnique(mobile, excludeId)),
        map((request) => request),
        catchError(() => of(null))
      );
    };
  }

  private passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (!password && !confirmPassword) return null;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get f() {
    return this.userForm.controls;
  }

  get passwordStrength() {
    const password = this.userForm.get('password')?.value;
    return this.passwordStrengthPipe.transform(password);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.userForm.value;
    const userData: Partial<User> = {
      username: formValue.username,
      email: formValue.email,
      mobile: formValue.mobile,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: { id: formValue.roleId, name: this.roles.find(r => r.id === formValue.roleId)?.name || 'User', permissions: [] },
      status: formValue.status
    };

    if (!this.isEditMode() && formValue.password) {
      userData.password = formValue.password;
    }

    const request = this.isEditMode()
      ? this.userApi.updateUser(this.userId()!, userData)
      : this.userApi.createUser(userData);

    request.subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toaster.success(
            this.isEditMode() ? 'User Updated' : 'User Created',
            `User ${formValue.username} has been ${this.isEditMode() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/user-management']);
        } else {
          this.modalService.showError('Error', response.message);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const message = error.error?.message || `Failed to ${this.isEditMode() ? 'update' : 'create'} user`;
        this.modalService.showError('Error', message);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/user-management']);
  }
}
