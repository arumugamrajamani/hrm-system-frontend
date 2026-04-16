import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface FormFieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'daterange'
    | 'slider'
    | 'autocomplete';
  placeholder?: string;
  hint?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validators?: {
    required?: boolean | string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string | RegExp;
    email?: boolean;
    custom?: (control: AbstractControl) => any;
  };
  appearance?: 'outline' | 'fill';
  disabled?: boolean;
  readonly?: boolean;
  showIf?: { field: string; value: any };
  gridColumn?: string;
}

@Component({
  selector: 'app-smart-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SmartFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SmartFormComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="smart-form" [class.inline]="layout === 'inline'">
      <div class="form-grid">
        @for (field of visibleFields; track field.key) {
          <mat-form-field
            [appearance]="field.appearance || 'outline'"
            [style.grid-column]="field.gridColumn || 'span 1'"
            class="form-field"
          >
            <mat-label>{{ field.label }}</mat-label>

            @switch (field.type) {
              @case ('text') {
                <ng-container>
                  <input
                    matInput
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [readonly]="field.readonly"
                  />
                </ng-container>
              }
              @case ('email') {
                <ng-container>
                  <input
                    matInput
                    type="email"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder || ''"
                  />
                  <mat-icon matSuffix>email</mat-icon>
                </ng-container>
              }
              @case ('password') {
                <ng-container>
                  <input
                    matInput
                    type="password"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder || ''"
                  />
                  <mat-icon matSuffix>lock</mat-icon>
                </ng-container>
              }
              @case ('number') {
                <ng-container>
                  <input
                    matInput
                    type="number"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder || ''"
                  />
                </ng-container>
              }
              @case ('textarea') {
                <ng-container>
                  <textarea
                    matInput
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder || ''"
                    cdkTextareaAutosize
                    cdkAutosizeMinRows="3"
                  ></textarea>
                </ng-container>
              }
              @case ('select') {
                <ng-container>
                  <mat-select [formControlName]="field.key">
                    @for (option of field.options; track option.value) {
                      <mat-option [value]="option.value">{{ option.label }}</mat-option>
                    }
                  </mat-select>
                </ng-container>
              }
              @case ('multiselect') {
                <ng-container>
                  <mat-select [formControlName]="field.key" multiple>
                    @for (option of field.options; track option.value) {
                      <mat-option [value]="option.value">{{ option.label }}</mat-option>
                    }
                  </mat-select>
                </ng-container>
              }
              @case ('checkbox') {
                <ng-container>
                  <mat-checkbox [formControlName]="field.key">{{ field.placeholder }}</mat-checkbox>
                </ng-container>
              }
              @case ('radio') {
                <ng-container>
                  <mat-radio-group [formControlName]="field.key">
                    @for (option of field.options; track option.value) {
                      <mat-radio-button [value]="option.value">{{ option.label }}</mat-radio-button>
                    }
                  </mat-radio-group>
                </ng-container>
              }
              @case ('date') {
                <ng-container>
                  <input matInput [matDatepicker]="picker" [formControlName]="field.key" />
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </ng-container>
              }
              @case ('slider') {
                <ng-container>
                  <mat-slider
                    [min]="field.validators?.min || 0"
                    [max]="field.validators?.max || 100"
                    [step]="1"
                    showTickMarks
                    discrete
                  >
                    <input matSliderThumb [formControlName]="field.key" />
                  </mat-slider>
                </ng-container>
              }
            }

            @if (field.hint && field.type !== 'checkbox' && field.type !== 'radio') {
              <mat-hint>{{ field.hint }}</mat-hint>
            }

            @if (hasError(field.key)) {
              <mat-error>{{ getError(field.key) }}</mat-error>
            }
          </mat-form-field>
        }
      </div>

      <div class="form-actions">
        <ng-content></ng-content>
        @if (showReset) {
          <button mat-button type="button" (click)="reset()">Reset</button>
        }
      </div>
    </form>
  `,
  styles: [
    `
      .smart-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }

      .form-field {
        width: 100%;
      }

      .form-field.full-width {
        grid-column: 1 / -1;
      }

      .inline .form-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .inline .form-field {
        flex: 1;
        min-width: 200px;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 16px;
        border-top: 1px solid var(--border-color, #e0e0e0);
      }

      mat-checkbox,
      mat-radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      mat-radio-button {
        margin-right: 16px;
      }
    `,
  ],
})
export class SmartFormComponent implements OnInit, ControlValueAccessor {
  @Input() fields: FormFieldConfig[] = [];
  @Input() layout: 'grid' | 'inline' = 'grid';
  @Input() showReset = true;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<any>();
  @Output() statusChange = new EventEmitter<any>();

  form!: FormGroup;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  get visibleFields(): FormFieldConfig[] {
    return this.fields.filter((field) => {
      if (!field.showIf) return true;
      const control = this.form?.get(field.showIf.field);
      return control?.value === field.showIf.value;
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const formControls: Record<string, any> = {};

    this.fields.forEach((field) => {
      const validators = this.buildValidators(field);
      formControls[field.key] = [{ value: null, disabled: field.disabled }, validators];
    });

    this.form = new FormBuilder().group(formControls);

    this.form.valueChanges.subscribe((value) => {
      this.onChange(value);
      this.valueChange.emit(value);
    });

    this.form.statusChanges.subscribe((status) => {
      this.statusChange.emit(status);
    });
  }

  private buildValidators(field: FormFieldConfig): any[] {
    const validators: any[] = [];

    if (field.validators?.required) {
      validators.push(Validators.required);
    }
    if (field.validators?.minLength) {
      validators.push(Validators.minLength(field.validators.minLength));
    }
    if (field.validators?.maxLength) {
      validators.push(Validators.maxLength(field.validators.maxLength));
    }
    if (field.validators?.min !== undefined) {
      validators.push(Validators.min(field.validators.min));
    }
    if (field.validators?.max !== undefined) {
      validators.push(Validators.max(field.validators.max));
    }
    if (field.validators?.pattern) {
      validators.push(Validators.pattern(field.validators.pattern));
    }
    if (field.validators?.email) {
      validators.push(Validators.email);
    }
    if (field.validators?.custom) {
      validators.push(field.validators.custom);
    }

    return validators;
  }

  hasError(key: string): boolean {
    const control = this.form.get(key);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(key: string): string {
    const control = this.form.get(key);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${this.getFieldLabel(key)} is required`;
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
    if (control.errors['pattern']) return 'Invalid format';
    if (control.errors['email']) return 'Invalid email address';

    return 'Invalid value';
  }

  private getFieldLabel(key: string): string {
    const field = this.fields.find((f) => f.key === key);
    return field?.label || key;
  }

  reset(): void {
    this.form.reset();
  }

  validate(): any {
    return this.form.valid ? null : { invalid: true };
  }

  writeValue(value: any): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  getValue(): any {
    return this.form.value;
  }

  isValid(): boolean {
    return this.form.valid;
  }

  markAsTouched(): void {
    this.form.markAllAsTouched();
  }
}
