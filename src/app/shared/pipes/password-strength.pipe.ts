import { Pipe, PipeTransform } from '@angular/core';
import { PasswordStrength } from '../../core/models';

@Pipe({
  name: 'passwordStrength',
  standalone: false
})
export class PasswordStrengthPipe implements PipeTransform {
  transform(password: string): PasswordStrength {
    if (!password) {
      return { score: 0, level: 'weak', color: '#dc3545', message: 'Enter password' };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score: 33, level: 'weak', color: '#dc3545', message: 'Weak' };
    } else if (score <= 4) {
      return { score: 66, level: 'medium', color: '#fd7e14', message: 'Medium' };
    } else {
      return { score: 100, level: 'strong', color: '#28a745', message: 'Strong' };
    }
  }
}
