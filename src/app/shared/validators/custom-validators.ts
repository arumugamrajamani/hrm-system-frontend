import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || typeof value !== 'string') return null;
      return value.trim().length > 0
        ? null
        : { notBlank: { message: 'This field cannot be blank' } };
    };
  }

  static minLengthTrimmed(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || typeof value !== 'string') return null;
      const trimmedLength = value.trim().length;
      return trimmedLength >= min
        ? null
        : {
            minLengthTrimmed: {
              requiredLength: min,
              actualLength: trimmedLength,
              message: `Minimum ${min} characters required (excluding spaces)`,
            },
          };
    };
  }

  static maxLengthTrimmed(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || typeof value !== 'string') return null;
      const trimmedLength = value.trim().length;
      return trimmedLength <= max
        ? null
        : {
            maxLengthTrimmed: {
              requiredLength: max,
              actualLength: trimmedLength,
              message: `Maximum ${max} characters allowed (excluding spaces)`,
            },
          };
    };
  }

  static patternValidator(pattern: RegExp, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const valid = pattern.test(value);
      return valid
        ? null
        : {
            pattern: {
              requiredPattern: pattern.toString(),
              actualValue: value,
              message: message || 'Invalid format',
            },
          };
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLongEnough = value.length >= 8;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && isLongEnough;

      if (!passwordValid) {
        return {
          strongPassword: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            isLongEnough,
            message:
              'Password must contain at least 8 characters, including uppercase, lowercase, and numbers',
          },
        };
      }

      return null;
    };
  }

  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const cleaned = value.toString().replace(/\D/g, '');
      const valid = /^[6-9]\d{9}$/.test(cleaned) || cleaned.length === 10;

      return valid
        ? null
        : {
            phoneNumber: {
              actualValue: value,
              message: 'Please enter a valid 10-digit phone number',
            },
          };
    };
  }

  static emailList(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const emails = value
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e);
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const invalidEmails = emails.filter((email: string) => !emailPattern.test(email));

      return invalidEmails.length === 0
        ? null
        : {
            emailList: {
              invalidEmails,
              message: `Invalid email(s): ${invalidEmails.join(', ')}`,
            },
          };
    };
  }

  static dateRange(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const date = new Date(value);

      if (minDate && date < minDate) {
        return {
          dateRange: {
            minDate,
            actualValue: date,
            message: `Date must be after ${minDate.toLocaleDateString()}`,
          },
        };
      }

      if (maxDate && date > maxDate) {
        return {
          dateRange: {
            maxDate,
            actualValue: date,
            message: `Date must be before ${maxDate.toLocaleDateString()}`,
          },
        };
      }

      return null;
    };
  }

  static matchField(fieldName: string, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fieldValue = control.parent?.get(fieldName)?.value;
      const thisValue = control.value;

      if (!thisValue || !fieldValue) return null;

      return thisValue === fieldValue
        ? null
        : {
            matchField: {
              matchField: fieldName,
              message: message || `Must match ${fieldName}`,
            },
          };
    };
  }

  static notEqualTo(excludedValue: any, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      return value !== excludedValue
        ? null
        : {
            notEqualTo: {
              excludedValue,
              message: message || `Value cannot be "${excludedValue}"`,
            },
          };
    };
  }

  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { range: { min, max, message: 'Please enter a valid number' } };
      }

      if (numValue < min || numValue > max) {
        return {
          range: {
            min,
            max,
            actualValue: numValue,
            message: `Value must be between ${min} and ${max}`,
          },
        };
      }

      return null;
    };
  }

  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file) return null;

      if (file instanceof File) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedTypes.includes(extension)) {
          return {
            fileType: {
              allowedTypes,
              actualType: extension,
              message: `File type must be one of: ${allowedTypes.join(', ')}`,
            },
          };
        }
      }

      return null;
    };
  }

  static fileSize(maxSizeMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file) return null;

      if (file instanceof File) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          return {
            fileSize: {
              maxSizeMB,
              actualSize: file.size,
              message: `File size must not exceed ${maxSizeMB}MB`,
            },
          };
        }
      }

      return null;
    };
  }

  static json(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      if (typeof value === 'object') return null;

      try {
        JSON.parse(value);
        return null;
      } catch {
        return {
          json: {
            actualValue: value,
            message: 'Invalid JSON format',
          },
        };
      }
    };
  }

  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      try {
        new URL(value);
        return null;
      } catch {
        return {
          url: {
            actualValue: value,
            message: 'Please enter a valid URL',
          },
        };
      }
    };
  }

  static aadhar(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const cleaned = value.toString().replace(/\D/g, '');
      const valid = /^\d{12}$/.test(cleaned);

      return valid
        ? null
        : {
            aadhar: {
              actualValue: value,
              message: 'Please enter a valid 12-digit Aadhar number',
            },
          };
    };
  }

  static pan(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const valid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase());

      return valid
        ? null
        : {
            pan: {
              actualValue: value,
              message: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
            },
          };
    };
  }

  static gstin(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const valid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        value.toUpperCase(),
      );

      return valid
        ? null
        : {
            gstin: {
              actualValue: value,
              message: 'Please enter a valid GSTIN',
            },
          };
    };
  }

  static ifsc(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const valid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase());

      return valid
        ? null
        : {
            ifsc: {
              actualValue: value,
              message: 'Please enter a valid IFSC code',
            },
          };
    };
  }
}
