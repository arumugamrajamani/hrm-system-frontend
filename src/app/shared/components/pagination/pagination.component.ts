import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatSelectModule, MatFormFieldModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagination-container" [class.compact]="compact">
      @if (showPageSizeOptions && !compact) {
        <div class="page-size-selector">
          <span class="label">Items per page:</span>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-select [value]="pageSize" (selectionChange)="onPageSizeChange($event.value)">
              @for (size of pageSizeOptions; track size) {
                <mat-option [value]="size">{{ size }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      }

      <mat-paginator
        [length]="length"
        [pageIndex]="pageIndex"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [showFirstLastButtons]="showFirstLastButtons"
        (page)="onPageChange($event)"
      >
      </mat-paginator>

      @if (showTotal && !compact) {
        <div class="total-info">
          <span>Showing {{ startItem }} - {{ endItem }} of {{ length }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .pagination-container {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        padding: 16px;
        background: var(--surface, white);
        border-top: 1px solid var(--border-color, #e0e0e0);
      }

      .pagination-container.compact {
        padding: 8px;
        justify-content: space-between;
      }

      .page-size-selector {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .page-size-selector .label {
        font-size: 14px;
        color: var(--text-secondary, #757575);
      }

      .page-size-selector mat-form-field {
        width: 80px;
      }

      .total-info {
        font-size: 14px;
        color: var(--text-secondary, #757575);
      }

      mat-form-field {
        height: 40px;
      }

      ::ng-deep .compact mat-paginator {
        background: transparent;
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() length = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showFirstLastButtons = true;
  @Input() showPageSizeOptions = true;
  @Input() showTotal = true;
  @Input() compact = false;

  @Output() page = new EventEmitter<PageEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  get startItem(): number {
    if (this.length === 0) return 0;
    return this.pageIndex * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.length);
  }

  onPageChange(event: PageEvent): void {
    this.page.emit(event);
    this.pageChange.emit(event);
  }

  onPageSizeChange(size: number): void {
    const newPageEvent: PageEvent = {
      pageIndex: 0,
      pageSize: size,
      length: this.length,
    };
    this.page.emit(newPageEvent);
    this.pageChange.emit(newPageEvent);
  }
}
