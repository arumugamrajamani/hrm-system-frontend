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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { GradeStore } from '../../services/grade.store';
import { Grade } from '../../models/grade.model';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-grade-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss'],
})
export class GradeFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  gradeForm = signal<FormGroup>({} as FormGroup);

  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  editingId = signal<number>(0);

  private globalError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: GradeStore,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadGrade(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    const form = this.fb.group({
      grade_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      grade_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9-_]+$/),
        ],
      ],
      level: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      description: ['', Validators.maxLength(1000)],
      min_salary: [null, [Validators.min(0)]],
      max_salary: [null, [Validators.min(0)]],
      currency: ['USD'],
      status: ['active'],
    });

    this.gradeForm.set(form);
  }

  loadGrade(id: number): void {
    this.isLoading.set(true);
    this.store.loadGradeById(id);

    setTimeout(() => {
      const grade = this.store.selectedGrade();
      if (grade) {
        this.gradeForm().patchValue({
          grade_name: grade.name,
          grade_code: grade.code,
          level: grade.level,
          description: grade.description || '',
          min_salary: grade.minSalary || null,
          max_salary: grade.maxSalary || null,
          currency: grade.currency || 'USD',
          status: grade.status,
        });
      }
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.gradeForm().get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || field.errors?.['serverError'])
    );
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.gradeForm().get(fieldName);
    return !!(field && field.hasError(errorType));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.gradeForm().get(fieldName);
    if (field?.errors?.['serverError']) {
      return field.errors['serverError'];
    }
    return '';
  }

  isFormValid(): boolean {
    return this.gradeForm().valid;
  }

  onSubmit(): void {
    const form = this.gradeForm();

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
      this.store.updateGrade(this.editingId(), formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Grade updated successfully');
            this.router.navigate(['/masters/grades/list']);
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
      this.store.createGrade(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (response?.success) {
            this.toasterService.success('Success', 'Grade created successfully');
            this.router.navigate(['/masters/grades/list']);
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
    this.router.navigate(['/masters/grades/list']);
  }

  private handleError(error: any): void {
    let errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred';

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      const errors = error.error.errors;
      if (errors.length > 0) {
        errorMessage = errors[0].message || errorMessage;
        const fieldName = this.mapApiFieldToFormField(errors[0].field);
        if (fieldName) {
          const field = this.gradeForm().get(fieldName);
          if (field) {
            field.setErrors({ serverError: errors[0].message });
          }
        }
      }
    }

    this.globalError.set(errorMessage);
    this.toasterService.error('Error', errorMessage);
  }

  private mapApiFieldToFormField(apiField: string): string | null {
    const fieldMapping: Record<string, string> = {
      name: 'grade_name',
      code: 'grade_code',
      level: 'level',
      description: 'description',
      min_salary: 'min_salary',
      max_salary: 'max_salary',
      currency: 'currency',
      status: 'status',
    };
    return fieldMapping[apiField] || null;
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
