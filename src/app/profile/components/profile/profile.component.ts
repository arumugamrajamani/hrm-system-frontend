import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserApiService } from '../../../user-management/services';
import { AuthService, ToasterService } from '../../../core/services';
import { User } from '../../../core/models';

function mobileValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(control.value) ? null : { invalidMobile: true };
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userApi = inject(UserApiService);
  private authService = inject(AuthService);
  private toaster = inject(ToasterService);
  private router = inject(Router);

  profileForm!: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  profilePhotoPreview = signal<string | null>(null);

  statuses = ['active', 'inactive', 'pending'];

  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'User' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, mobileValidator]],
      role_id: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }],
      profile_photo: [''],
    });
  }

  private loadProfile(): void {
    const user = this.authService.currentUser();
    if (!user || !user.id) {
      this.toaster.error('Error', 'User not found');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.isLoading.set(true);
    this.userApi.getUser(user.id).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          const userData = response.data;
          this.profileForm.patchValue({
            username: userData.username,
            email: userData.email,
            mobile: userData.mobile,
            role_id: userData.role_id || userData.role?.id,
            status: userData.status || 'active',
          });
          if (userData.profile_photo) {
            this.profilePhotoPreview.set(userData.profile_photo);
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toaster.error('Error', 'Failed to load profile');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        this.toaster.error('Invalid File', 'Please upload a valid image (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > maxSize) {
        this.toaster.error('File Too Large', 'Image must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhotoPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePhoto(): void {
    this.profilePhotoPreview.set(null);
    this.profileForm.patchValue({ profile_photo: '' });
  }

  get f() {
    return this.profileForm.controls;
  }

  getRoleName(roleId: number | undefined): string {
    if (!roleId) return 'User';
    const role = this.roles.find((r) => r.id === roleId);
    return role ? role.name : 'User';
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const user = this.authService.currentUser();

    if (!user || !user.id) {
      this.isLoading.set(false);
      this.toaster.error('Error', 'User not found');
      return;
    }

    const formValue = this.profileForm.getRawValue();
    const updateData: any = {
      email: formValue.email,
      mobile: formValue.mobile,
      profile_photo: this.profilePhotoPreview(),
    };

    this.userApi.updateUser(user.id, updateData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toaster.success('Success', 'Profile updated successfully');
          const updatedUser = { ...user, ...updateData };
          this.authService.updateUser(updatedUser as User);
        } else {
          this.toaster.error('Error', response.message || 'Failed to update profile');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.toaster.error('Error', error.error?.message || 'Failed to update profile');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
