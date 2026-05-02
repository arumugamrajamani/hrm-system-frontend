import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowStore } from '../../services/workflow.store';
import {
  WorkflowHistory,
  WorkflowEntityType,
  WorkflowAction,
  getWorkflowEntityLabel,
} from '../../models/workflow.types';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-approval-history',
  standalone: false,
  templateUrl: './approval-history.component.html',
  styleUrls: ['./approval-history.component.scss'],
})
export class ApprovalHistoryComponent implements OnInit {
  readonly store = inject(WorkflowStore);

  fromDate = '';
  toDate = '';
  entityTypeFilter = '';
  actionFilter = '';
  skeletonRows = Array(8).fill(0);

  readonly entityTypes = Object.values(WorkflowEntityType);

  readonly getEntityLabel = getWorkflowEntityLabel;

  ngOnInit(): void {
    this.store.loadApprovalHistory();
  }

  onFilterChange(): void {
    const params: Record<string, unknown> = {};

    if (this.fromDate) {
      params['fromDate'] = this.fromDate;
    }
    if (this.toDate) {
      params['toDate'] = this.toDate;
    }
    if (this.entityTypeFilter) {
      params['entityType'] = this.entityTypeFilter;
    }
    if (this.actionFilter) {
      params['action'] = this.actionFilter;
    }

    this.store.loadApprovalHistory(params);
  }

  reload(): void {
    this.store.loadApprovalHistory();
  }

  getActionLabel(action: WorkflowAction | string): string {
    const labels: Record<string, string> = {
      approve: 'Approved',
      reject: 'Rejected',
      cancel: 'Cancelled',
      submit: 'Submitted',
      recall: 'Recalled',
      escalate: 'Escalated',
    };
    return labels[action] || action;
  }
}
