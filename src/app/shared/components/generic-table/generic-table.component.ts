import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { SelectionModel } from '@angular/cdk/collections';
import { FormsModule } from '@angular/forms';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: T) => string;
  template?: TemplateRef<{ $implicit: T; column: TableColumn<T> }>;
}

export interface PaginationConfig {
  pageIndex: number;
  pageSize: number;
  length: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
}

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ScrollingModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-container" [class.loading]="loading">
      @if (searchable || filterable) {
        <div class="table-controls">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input
              matInput
              [placeholder]="searchPlaceholder"
              [value]="searchValue"
              (input)="onSearchChange($event)"
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <ng-content select="[slot=filters]"></ng-content>
        </div>
      }

      <div class="table-wrapper">
        @if (loading && !data.length) {
          <div class="table-skeleton">
            @for (row of skeletonRows; track $index) {
              <div class="skeleton-row">
                @if (selectable) {
                  <div class="skeleton-cell checkbox"></div>
                }
                @for (col of columns; track col.key) {
                  <div class="skeleton-cell" [style.width]="col.width || '100px'"></div>
                }
              </div>
            }
          </div>
        } @else {
          <cdk-virtual-scroll-viewport
            [itemSize]="itemSize"
            class="table-viewport"
            [minBufferPx]="itemSize * 10"
            [maxBufferPx]="itemSize * 20"
          >
            @if (!virtualScroll) {
              <table mat-table [dataSource]="data" class="data-table">
                @if (selectable) {
                  <ng-container matColumnDef="select">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-checkbox
                        (change)="toggleAllRows()"
                        [checked]="selection.hasValue() && isAllSelected()"
                        [indeterminate]="selection.hasValue() && !isAllSelected()"
                      >
                      </mat-checkbox>
                    </th>
                    <td mat-cell *matCellDef="let row">
                      <mat-checkbox
                        (click)="$event.stopPropagation()"
                        (change)="toggleRow(row)"
                        [checked]="selection.isSelected(row)"
                      >
                      </mat-checkbox>
                    </td>
                  </ng-container>
                }

                @for (column of columns; track column.key) {
                  <ng-container [matColumnDef]="column.key">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      [style.textAlign]="column.align || 'left'"
                      [mat-sort-header]="column.sortable ? column.key : ''"
                      [disabled]="!column.sortable"
                    >
                      {{ column.label }}
                    </th>
                    <td mat-cell *matCellDef="let row" [style.textAlign]="column.align || 'left'">
                      @if (column.template) {
                        <ng-container
                          [ngTemplateOutlet]="column.template"
                          [ngTemplateOutletContext]="{ $implicit: row, column: column }"
                        >
                        </ng-container>
                      } @else {
                        {{
                          column.format
                            ? column.format(getValue(row, column.key), row)
                            : getValue(row, column.key)
                        }}
                      }
                    </td>
                  </ng-container>
                }

                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: stickyHeader"></tr>
                @if (virtualScroll) {
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                    cdkVirtualFor="let row of data; trackBy: trackByFn"
                    [class.selected]="isSelected(row)"
                    (click)="onRowClick(row)"
                  ></tr>
                } @else {
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                    [class.selected]="isSelected(row)"
                    (click)="onRowClick(row)"
                  ></tr>
                }
              </table>
            }
          </cdk-virtual-scroll-viewport>

          @if (!data.length && !loading) {
            <div class="empty-state">
              <ng-content select="[slot=empty]"></ng-content>
              @if (!hasEmptySlot) {
                <mat-icon>inbox</mat-icon>
                <p>{{ emptyMessage }}</p>
              }
            </div>
          }
        }
      </div>

      @if (showPagination && !virtualScroll && data.length > 0) {
        <mat-paginator
          [length]="paginationConfig.length"
          [pageIndex]="paginationConfig.pageIndex"
          [pageSize]="paginationConfig.pageSize"
          [pageSizeOptions]="paginationConfig.pageSizeOptions || [10, 25, 50, 100]"
          [showFirstLastButtons]="paginationConfig.showFirstLastButtons !== false"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      }
    </div>
  `,
  styles: [
    `
      .table-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
      }

      .table-controls {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 250px;
        max-width: 400px;
      }

      .table-wrapper {
        flex: 1;
        overflow: hidden;
        border-radius: 8px;
        border: 1px solid var(--border-color, #e0e0e0);
      }

      .table-viewport {
        height: 100%;
        min-height: 200px;
      }

      .data-table {
        width: 100%;
      }

      th.mat-header-cell {
        font-weight: 600;
        background: var(--header-bg, #f5f5f5);
      }

      tr.mat-mdc-row:hover {
        background: var(--row-hover, #fafafa);
        cursor: pointer;
      }

      tr.mat-mdc-row.selected {
        background: var(--row-selected, #e3f2fd);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        color: var(--text-secondary, #757575);
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        opacity: 0.5;
      }

      .table-skeleton {
        padding: 16px;
      }

      .skeleton-row {
        display: flex;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
      }

      .skeleton-cell {
        height: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-cell.checkbox {
        width: 40px;
        height: 20px;
      }

      @keyframes skeleton-loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class GenericTableComponent<T extends Record<string, any>> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() searchable = false;
  @Input() filterable = false;
  @Input() virtualScroll = false;
  @Input() stickyHeader = true;
  @Input() showPagination = true;
  @Input() itemSize = 48;
  @Input() searchPlaceholder = 'Search...';
  @Input() searchValue = '';
  @Input() emptyMessage = 'No data available';
  @Input() paginationConfig: PaginationConfig = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };
  @Input() trackByFn: (index: number, item: T) => any = (index, item) => item['id'] ?? index;

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  @ContentChild('empty') emptyTemplate?: TemplateRef<any>;

  selection = new SelectionModel<T>(true, []);
  skeletonRows = Array(5).fill(0);
  hasEmptySlot = false;

  get displayedColumns(): string[] {
    const cols = this.columns.map((c) => c.key);
    if (this.selectable) {
      return ['select', ...cols];
    }
    return cols;
  }

  getValue(row: T, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  isSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  isAllSelected(): boolean {
    return this.data.length > 0 && this.selection.selected.length === this.data.length;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.data.forEach((row) => this.selection.select(row));
    }
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: T): void {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  clearSelection(): void {
    this.selection.clear();
    this.selectionChange.emit([]);
  }
}
