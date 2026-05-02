import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { WorkflowApiService } from './workflow-api.service';
import {
  Workflow,
  WorkflowHistory,
  WorkflowActionRequest,
  WorkflowEntityType,
  WorkflowStatus,
} from '../models/workflow.types';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { BaseStore } from '../../../core/stores/base.store';
import type { DetailResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class WorkflowStore extends BaseStore<Workflow> {
  private readonly api = inject(WorkflowApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _history = signal<WorkflowHistory[]>([]);
  private readonly _stats = signal<{
    pendingCount: number;
    byEntityType: Record<WorkflowEntityType, number>;
  } | null>(null);

  readonly history = this._history.asReadonly();
  readonly stats = this._stats.asReadonly();

  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canManage = computed(() => this.rbacService.hasPermission(Permission.MANAGE));

  readonly pendingByEntityType = computed(() => {
    const items = this.items();
    const grouped: Record<string, Workflow[]> = {};
    items.forEach((workflow) => {
      const key = workflow.entityType;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(workflow);
    });
    return grouped;
  });

  loadPendingApprovals(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this._error.set(null);

    this.api.getPendingApprovals(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.setItems(response.data || []);
          if (response.pagination) {
            this.updatePaginationResponse(response);
          }
        } else {
          this.setError(response.message || 'Failed to load pending approvals');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadApprovalHistory(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this._error.set(null);

    this.api.getApprovalHistory(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._history.set(response.data || []);
        } else {
          this.setError(response.message || 'Failed to load approval history');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadWorkflowById(id: number): Observable<DetailResponse<Workflow> | null> {
    return this.api.getWorkflowById(id).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._selected.set(response.data);
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'Failed to load workflow');
        return of(null);
      }),
    );
  }

  approve(data: WorkflowActionRequest): Observable<any> {
    this.setLoading(true);
    return this.api.approveStep(data).pipe(
      tap((response) => {
        if (response.success) {
          this.removeItemFromList(data.workflowId);
        } else {
          this.setError(response.message || 'Failed to approve');
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      tap(() => this.setLoading(false)),
    );
  }

  reject(data: WorkflowActionRequest): Observable<any> {
    this.setLoading(true);
    return this.api.rejectStep(data).pipe(
      tap((response) => {
        if (response.success) {
          this.removeItemFromList(data.workflowId);
        } else {
          this.setError(response.message || 'Failed to reject');
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      tap(() => this.setLoading(false)),
    );
  }

  loadStats(): void {
    this.api.getApprovalStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._stats.set(response.data);
        }
      },
      error: () => {},
    });
  }

  override reset(): void {
    super.reset();
    this._history.set([]);
    this._stats.set(null);
  }
}
