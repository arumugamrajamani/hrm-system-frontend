import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  AuditLog,
  AuditAction,
  AuditEntityType,
  AuditLogFilter,
  AuditSummary,
  getAuditActionLabel,
  getAuditEntityLabel,
  formatAuditChange,
} from '../../models/audit.types';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-audit-log-list',
  standalone: false,
  template: `
    <div class="audit-container">
      <div class="header">
        <h2><i class="fas fa-history me-2"></i>Audit Log</h2>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Entity Type</mat-label>
          <mat-select [(ngModel)]="filters.entityType" (ngModelChange)="applyFilters()">
            <mat-option value="">All</mat-option>
            @for (type of entityTypes; track type) {
              <mat-option [value]="type">{{ getAuditEntityLabel(type) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Action</mat-label>
          <mat-select [(ngModel)]="filters.action" (ngModelChange)="applyFilters()">
            <mat-option value="">All</mat-option>
            @for (action of actions; track action) {
              <mat-option [value]="action">{{ getAuditActionLabel(action) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>From Date</mat-label>
          <input
            matInput
            [matDatepicker]="fromPicker"
            [(ngModel)]="filters.fromDate"
            (dateChange)="applyFilters()"
          />
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>To Date</mat-label>
          <input
            matInput
            [matDatepicker]="toPicker"
            [(ngModel)]="filters.toDate"
            (dateChange)="applyFilters()"
          />
          <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input
            matInput
            [(ngModel)]="filters.search"
            (ngModelChange)="onSearch($event)"
            placeholder="Search..."
          />
        </mat-form-field>

        <button mat-button (click)="clearFilters()">Clear</button>
      </div>

      @if (loading()) {
        <div class="loading">Loading audit logs...</div>
      } @else if (logs().length === 0) {
        <div class="empty-state">No audit logs found</div>
      } @else {
        <table mat-table [dataSource]="logs()" class="audit-table">
          <ng-container matColumnDef="performedAt">
            <th mat-header-cell *matHeaderCellDef>Timestamp</th>
            <td mat-cell *matCellDef="let log">{{ log.performedAt | date: 'medium' }}</td>
          </ng-container>

          <ng-container matColumnDef="performedByName">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let log">{{ log.performedByName || 'System' }}</td>
          </ng-container>

          <ng-container matColumnDef="entityType">
            <th mat-header-cell *matHeaderCellDef>Entity</th>
            <td mat-cell *matCellDef="let log">{{ getAuditEntityLabel(log.entityType) }}</td>
          </ng-container>

          <ng-container matColumnDef="entityName">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let log">{{ log.entityName || '#' + log.entityId }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let log">
              <span class="action-badge action-{{ log.action }}">{{
                getAuditActionLabel(log.action)
              }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let log">{{ log.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="expand">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let log">
              @if (log.changes?.length) {
                <button mat-icon-button [matTooltip]="'View changes'">
                  <mat-icon>expand_more</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

          @for (log of logs(); track log.id) {
            <tr class="detail-row" [class.expanded]="expandedLog() === log.id">
              <td [attr.colspan]="displayedColumns.length">
                @if (expandedLog() === log.id && log.changes?.length) {
                  <div class="changes-list">
                    @for (change of log.changes; track change.field) {
                      <div class="change-item">
                        <span class="field-name">{{ change.field }}:</span>
                        <span class="old-value">{{ change.oldValue ?? '(empty)' }}</span>
                        <span class="arrow">→</span>
                        <span class="new-value">{{ change.newValue ?? '(empty)' }}</span>
                      </div>
                    }
                  </div>
                }
              </td>
            </tr>
          }
        </table>

        <mat-paginator
          [pageSizeOptions]="[10, 25, 50, 100]"
          [pageSize]="pagination.limit"
          [length]="pagination.total"
          [pageIndex]="pagination.page - 1"
          (page)="onPageChange($event)"
        ></mat-paginator>
      }
    </div>
  `,
  styles: [
    `
      .audit-container {
        padding: 24px;
      }
      .header {
        margin-bottom: 24px;
      }
      .filters {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 24px;
        align-items: flex-end;
      }
      .filters mat-form-field {
        min-width: 180px;
      }
      .audit-table {
        width: 100%;
        background: white;
        border-radius: 8px;
      }
      .action-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      .action-create {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .action-update {
        background: #fff3e0;
        color: #e65100;
      }
      .action-delete {
        background: #ffebee;
        color: #c62828;
      }
      .action-approve {
        background: #e3f2fd;
        color: #1565c0;
      }
      .action-reject {
        background: #fce4ec;
        color: #ad1457;
      }
      .detail-row {
        display: none;
      }
      .detail-row.expanded {
        display: table-row;
      }
      .changes-list {
        padding: 12px 48px;
        background: #fafafa;
      }
      .change-item {
        padding: 4px 0;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .field-name {
        font-weight: 600;
        min-width: 120px;
      }
      .old-value {
        color: #c62828;
        text-decoration: line-through;
      }
      .new-value {
        color: #2e7d32;
      }
      .arrow {
        color: #999;
      }
      .loading,
      .empty-state {
        text-align: center;
        padding: 48px;
        color: #999;
      }
    `,
  ],
})
export class AuditLogListComponent implements OnInit {
  private http = inject(HttpClient);

  logs = signal<AuditLog[]>([]);
  loading = signal<boolean>(false);
  expandedLog = signal<number | null>(null);

  filters: AuditLogFilter = {};
  pagination = { page: 1, limit: 25, total: 0 };

  displayedColumns = [
    'performedAt',
    'performedByName',
    'entityType',
    'entityName',
    'action',
    'description',
    'expand',
  ];

  entityTypes = Object.values(AuditEntityType);
  actions = Object.values(AuditAction);

  readonly getAuditEntityLabel = getAuditEntityLabel;
  readonly getAuditActionLabel = getAuditActionLabel;

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading.set(true);
    const params: any = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      ...this.filters,
    };
    this.http.get<any>(`${environment.apiUrl}/audit-logs`, { params }).subscribe({
      next: (response) => {
        this.logs.set(response.data || []);
        this.pagination.total = response.pagination?.total || 0;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadAuditLogs();
  }

  onSearch(value: string): void {
    this.filters.search = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {};
    this.pagination.page = 1;
    this.loadAuditLogs();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.limit = event.pageSize;
    this.loadAuditLogs();
  }
}
