import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skip-link',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <a href="#main-content" class="skip-link"> Skip to main content </a> `,
  styles: [
    `
      .skip-link {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color, #3f51b5);
        color: white;
        padding: 12px 24px;
        border-radius: 0 0 8px 8px;
        text-decoration: none;
        font-weight: 600;
        z-index: 10000;
        transition: top 0.3s ease;
      }

      .skip-link:focus {
        top: 0;
        outline: 3px solid var(--primary-light, #818cf8);
        outline-offset: 2px;
      }
    `,
  ],
})
export class SkipLinkComponent {}
