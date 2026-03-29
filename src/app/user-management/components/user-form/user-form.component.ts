import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserApiService } from '../../services';
import { ToasterService, ModalService } from '../../../core/services';
import { PasswordStrengthPipe } from '../../../shared/pipes/password-strength.pipe';

function mobileValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(control.value) ? null : { invalidMobile: true };
}

function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const errors: ValidationErrors = {};
  if (value.length < 8) errors['minlength'] = true;
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
  if (!/[0-9]/.test(value)) errors['number'] = true;
  if (!/[^a-zA-Z0-9]/.test(value)) errors['specialChar'] = true;
  return Object.keys(errors).length > 0 ? errors : null;
}

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [PasswordStrengthPipe],
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
  profilePhotoPreview = signal<string | null>(null);
  selectedFile: File | null = null;

  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'User' },
  ];

  statuses = ['active', 'inactive', 'pending'];

  allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  maxFileSize = 2 * 1024 * 1024;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.userForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, mobileValidator]],
        password: ['', this.isEditMode() ? [] : [Validators.required, passwordValidator]],
        confirmPassword: ['', this.isEditMode() ? [] : [Validators.required]],
        role_id: ['', Validators.required],
        status: ['active', Validators.required],
        profile_photo: [''],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(+id);
      this.userForm = this.fb.group(
        {
          username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
          email: ['', [Validators.required, Validators.email]],
          mobile: ['', [Validators.required, mobileValidator]],
          password: [''],
          confirmPassword: [''],
          role_id: ['', Validators.required],
          status: ['active', Validators.required],
          profile_photo: [''],
        },
        { validators: this.passwordMatchValidator },
      );
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
            role_id: user.role_id || user.role?.id,
            status: user.status || 'active',
            profile_photo: user.profile_photo || '',
          });
          if (user.profile_photo) {
            this.profilePhotoPreview.set(user.profile_photo);
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toaster.error('Error', 'Failed to load user data');
        this.router.navigate(['/user-management']);
      },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!this.allowedImageTypes.includes(file.type)) {
        this.modalService.showError(
          'Invalid File',
          'Please upload a valid image (JPEG, PNG, GIF, WebP)',
        );
        input.value = '';
        return;
      }

      if (file.size > this.maxFileSize) {
        this.modalService.showError('File Too Large', 'Image must be less than 2MB');
        input.value = '';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhotoPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePhoto(): void {
    this.selectedFile = null;
    this.profilePhotoPreview.set(null);
    this.userForm.patchValue({ profile_photo: '' });
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
    return this.passwordStrengthPipe.transform(this.userForm.get('password')?.value);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.userForm.value;
    const file = this.selectedFile;

    if (file) {
      const formData = new FormData();
      formData.append('username', formValue.username);
      formData.append('email', formValue.email);
      formData.append('mobile', formValue.mobile);
      formData.append('role_id', formValue.role_id);
      formData.append('status', formValue.status);
      formData.append('profile_photo', file);

      if (!this.isEditMode() && formValue.password) {
        formData.append('password', formValue.password);
      }

      const apiCall = this.isEditMode()
        ? this.userApi.updateUserWithFile(this.userId()!, formData)
        : this.userApi.createUser(formData);

      apiCall.subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success) {
            this.toaster.success(
              this.isEditMode() ? 'User Updated' : 'User Created',
              `User ${formValue.username} has been ${this.isEditMode() ? 'updated' : 'created'} successfully`,
            );
            this.router.navigate(['/user-management']);
          } else {
            this.modalService.showError('Error', response.message);
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.modalService.showError('Error', error.error?.message || 'Failed to save user');
        },
      });
    } else {
      const userData: any = {
        username: formValue.username,
        email: formValue.email,
        mobile: formValue.mobile,
        role_id: formValue.role_id,
        status: formValue.status,
      };

      if (!this.isEditMode() && formValue.password) {
        userData.password = formValue.password;
      }

      const apiCall = this.isEditMode()
        ? this.userApi.updateUser(this.userId()!, userData)
        : this.userApi.createUser(userData);

      apiCall.subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success) {
            this.toaster.success(
              this.isEditMode() ? 'User Updated' : 'User Created',
              `User ${formValue.username} has been ${this.isEditMode() ? 'updated' : 'created'} successfully`,
            );
            this.router.navigate(['/user-management']);
          } else {
            this.modalService.showError('Error', response.message);
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.modalService.showError('Error', error.error?.message || 'Failed to save user');
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/user-management']);
  }
}
