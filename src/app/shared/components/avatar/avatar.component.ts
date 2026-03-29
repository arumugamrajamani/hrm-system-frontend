import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: false,
  template: `
    @if (processedImageUrl) {
      <img
        [src]="processedImageUrl"
        [alt]="name"
        class="avatar"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.fontSize.px]="size / 2.5"
      />
    } @else {
      <div
        class="avatar avatar-initials"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.fontSize.px]="size / 2.5"
        [style.backgroundColor]="getColor()"
      >
        {{ getInitials() }}
      </div>
    }
  `,
  styles: [
    `
      .avatar {
        border-radius: 50%;
        object-fit: cover;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .avatar-initials {
        color: white;
        font-weight: 600;
        text-transform: uppercase;
      }
    `,
  ],
})
export class AvatarComponent {
  @Input() name = '';
  @Input() imageUrl?: string | null;
  @Input() size = 40;

  get processedImageUrl(): string | null {
    if (!this.imageUrl) return null;
    if (this.imageUrl.startsWith('data:')) return this.imageUrl;
    const match = this.imageUrl.match(/^https?:\/\/[^/]+(\/.*)$/);
    return match ? match[1] : this.imageUrl;
  }

  getInitials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return parts[0][0];
  }

  getColor(): string {
    if (!this.name) return '#6c757d';
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#3498db',
      '#e74c3c',
      '#2ecc71',
      '#9b59b6',
      '#f39c12',
      '#1abc9c',
      '#34495e',
      '#e67e22',
    ];
    return colors[Math.abs(hash) % colors.length];
  }
}
