import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading) {
      <button mat-stroked-button disabled>
        <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
        Exporting...
      </button>
    } @else if (showMenu && formats.length > 1) {
      <button mat-stroked-button [matMenuTriggerFor]="exportMenu" [disabled]="disabled">
        <mat-icon>download</mat-icon>
        {{ label }}
        <mat-icon>arrow_drop_down</mat-icon>
      </button>
      <mat-menu #exportMenu="matMenu">
        @for (format of formats; track format) {
          <button mat-menu-item (click)="onExport(format)">
            <mat-icon>{{ formatIcons[format] }}</mat-icon>
            <span>Export as {{ format.toUpperCase() }}</span>
          </button>
        }
      </mat-menu>
    } @else {
      <button mat-stroked-button [disabled]="disabled" (click)="onExport(formats[0])">
        <mat-icon>download</mat-icon>
        {{ label }}
      </button>
    }
  `,
  styles: [
    `
      button {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      mat-progress-spinner {
        margin-right: 8px;
      }
    `,
  ],
})
export class ExportButtonComponent {
  @Input() label = 'Export';
  @Input() formats: ExportFormat[] = ['csv', 'excel'];
  @Input() disabled = false;
  @Input() loading = false;
  @Input() showMenu = true;

  @Output() export = new EventEmitter<ExportFormat>();

  formatIcons: Record<ExportFormat, string> = {
    csv: 'table_chart',
    excel: 'grid_on',
    pdf: 'picture_as_pdf',
    json: 'code',
  };

  onExport(format: ExportFormat): void {
    this.export.emit(format);
  }
}
