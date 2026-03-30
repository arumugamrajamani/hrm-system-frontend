import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { EducationService } from '../../services/education.service';
import { ToasterService } from '../../../core/services';
import { Education } from '../../models';

@Component({
  selector: 'app-education-form',
  standalone: false,
  templateUrl: './education-form.component.html',
  styleUrls: ['./education-form.component.scss'],
})
export class EducationFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  educationForm = signal<FormGroup>({} as FormGroup);
  education = signal<Education | null>(null);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  educationId = signal<number>(0);

  private globalError = signal<string>('');

  levels = ['School', 'UG', 'PG', 'Doctorate', 'Certification'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private educationService: EducationService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.educationId.set(id);
      this.loadEducation(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      education_name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      education_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9-_]+$/),
        ],
      ],
      level: ['', [Validators.required]],
      description: ['', Validators.maxLength(1000)],
      status: ['active'],
    });

    this.educationForm.set(form);
  }

  loadEducation(id: number): void {
    this.educationService.getEducationById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.education.set(response.data);
          this.educationForm().patchValue({
            education_name: response.data.education_name,
            education_code: response.data.education_code,
            level: response.data.level,
            description: response.data.description || '',
            status: response.data.status,
          });
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toasterService.error('Error', error.error?.message || 'Failed to load education');
        this.cdr.markForCheck();
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.educationForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  isFormValid(): boolean {
    return this.educationForm().valid;
  }

  onSubmit(): void {
    const form = this.educationForm();

    Object.keys(form.controls).forEach((key) => {
      form.get(key)?.markAsTouched();
    });

    if (form.invalid) {
      this.toasterService.error('Validation Error', 'Please fix the form errors before submitting');
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting.set(true);
    const formData = { ...form.value };

    if (this.isEditMode()) {
      this.educationService.updateEducation(this.educationId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Education updated successfully');
            this.router.navigate(['/education/list']);
          } else {
            this.handleError(response);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.handleError(error);
          this.cdr.markForCheck();
        },
      });
    } else {
      this.educationService.createEducation(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response.success) {
            this.toasterService.success('Success', 'Education created successfully');
            this.router.navigate(['/education/list']);
          } else {
            this.handleError(response);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.handleError(error);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/education/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error.error?.message || 'An unexpected error occurred';

    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = errors[0].field;
        if (fieldName) {
          const field = this.educationForm().get(fieldName);
          if (field) {
            field.setErrors({ serverError: errors[0].message });
          }
        }
      }
    }

    this.globalError.set(errorMessage);
    this.toasterService.error('Error', errorMessage);
  }

  hasGlobalError(): boolean {
    return this.globalError() !== '';
  }

  getGlobalError(): string {
    return this.globalError();
  }

  clearGlobalError(): void {
    this.globalError.set('');
  }
}
