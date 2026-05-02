import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkflowStore } from '../../services/workflow.store';
import {
  Workflow,
  WorkflowEntityType,
  WorkflowStatus,
  WorkflowAction,
  getWorkflowStatusLabel,
  getWorkflowEntityLabel,
} from '../../models/workflow.types';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-approval-inbox',
  standalone: false,
  templateUrl: './approval-inbox.component.html',
  styleUrls: ['./approval-inbox.component.scss'],
})
export class ApprovalInboxComponent implements OnInit {
  readonly store = inject(WorkflowStore);
  private router = inject(Router);

  searchTerm = '';
  entityTypeFilter = '';
  priorityFilter = '';
  dateFilter = '';
  skeletonRows = Array(5).fill(0);

  readonly entityTypes = Object.values(WorkflowEntityType);
  readonly Permission = Permission;
  readonly getStatusLabel = getWorkflowStatusLabel;
  readonly getEntityLabel = getWorkflowEntityLabel;

  readonly groupedItems = computed(() => {
    const items = this.store.items();
    const grouped: { entityType: WorkflowEntityType; items: Workflow[] }[] = [];

    const groupedMap = new Map<WorkflowEntityType, Workflow[]>();
    items.forEach((workflow) => {
      const type = workflow.entityType;
      if (!groupedMap.has(type)) {
        groupedMap.set(type, []);
      }
      groupedMap.get(type)!.push(workflow);
    });

    groupedMap.forEach((items, entityType) => {
      grouped.push({ entityType, items });
    });

    return grouped;
  });

  ngOnInit(): void {
    this.store.loadPendingApprovals();
    this.store.loadStats();
  }

  onSearch(): void {
    this.store.loadPendingApprovals({
      search: this.searchTerm,
      page: 1,
    });
  }

  onFilterChange(): void {
    this.store.loadPendingApprovals({
      entityType: this.entityTypeFilter || undefined,
      priority: this.priorityFilter || undefined,
      date: this.dateFilter || undefined,
      page: 1,
    });
  }

  reload(): void {
    this.store.loadPendingApprovals();
  }

  viewWorkflow(workflow: Workflow): void {
    this.router.navigate(['/approvals', workflow.id]);
  }

  onApprove(workflow: Workflow): void {
    if (confirm(`Approve workflow: ${workflow.title}?`)) {
      const currentStep = workflow.steps?.find((s) => s.stepOrder === workflow.currentStep);
      if (currentStep) {
        this.store
          .approve({
            workflowId: workflow.id,
            stepId: currentStep.id,
            action: WorkflowAction.APPROVE,
          })
          .subscribe();
      }
    }
  }

  onReject(workflow: Workflow): void {
    const comments = prompt('Enter rejection reason:');
    if (comments) {
      const currentStep = workflow.steps?.find((s) => s.stepOrder === workflow.currentStep);
      if (currentStep) {
        this.store
          .reject({
            workflowId: workflow.id,
            stepId: currentStep.id,
            action: WorkflowAction.REJECT,
            comments,
          })
          .subscribe();
      }
    }
  }

  getDueDate(workflow: Workflow): string | null {
    const currentStep = workflow.steps?.find((s) => s.stepOrder === workflow.currentStep);
    return currentStep?.dueDate || null;
  }

  isOverdue(workflow: Workflow): boolean {
    const dueDate = this.getDueDate(workflow);
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
}
