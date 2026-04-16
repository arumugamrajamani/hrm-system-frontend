import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  KanbanBoardComponent,
  KanbanColumnConfig,
  KanbanItem,
} from '../../../../shared/components/kanban-board/kanban-board.component';
import { KanbanService, LeaveStatus } from '../../../../core/services/kanban.service';
import { LeaveStore } from '../../services/leave.store';

@Component({
  selector: 'app-leave-kanban',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, KanbanBoardComponent],
  template: `
    <div class="leave-kanban-page">
      <div class="page-header">
        <div class="header-title">
          <h1>
            <mat-icon>view_kanban</mat-icon>
            Leave Kanban Board
          </h1>
          <p>Drag and drop to manage leave requests</p>
        </div>
        <div class="header-actions">
          <button mat-button (click)="toggleView()">
            <mat-icon>{{ isKanbanView() ? 'view_list' : 'view_kanban' }}</mat-icon>
            {{ isKanbanView() ? 'List View' : 'Kanban View' }}
          </button>
          <button mat-flat-button color="primary" (click)="router.navigate(['/leave/apply'])">
            <mat-icon>add</mat-icon>
            New Request
          </button>
        </div>
      </div>

      <div class="stats-bar">
        @for (stat of kanbanService.columnStats(); track stat.id) {
          <div class="stat-item" [style.borderColor]="stat.color">
            <span class="stat-dot" [style.backgroundColor]="stat.color"></span>
            <span class="stat-label">{{ stat.title }}</span>
            <span class="stat-count">{{ stat.count }}</span>
          </div>
        }
      </div>

      <app-kanban-board
        [columns]="kanbanColumns()"
        [connectedLists]="connectedLists"
        (itemDropped)="onItemDropped($event)"
        (cardClicked)="onCardClicked($event)"
        (actionClicked)="onActionClicked($event)"
      ></app-kanban-board>
    </div>
  `,
  styles: [
    `
      .leave-kanban-page {
        height: calc(100vh - 120px);
        display: flex;
        flex-direction: column;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
      }

      .header-title h1 {
        font-size: 24px;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 4px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-title h1 mat-icon {
        color: #3f51b5;
      }

      .header-title p {
        color: #718096;
        margin: 0;
        font-size: 14px;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      .stats-bar {
        display: flex;
        gap: 16px;
        padding: 12px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: white;
        border-radius: 8px;
        border-left: 4px solid;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .stat-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .stat-label {
        font-size: 13px;
        color: #4a5568;
      }

      .stat-count {
        font-weight: 700;
        font-size: 16px;
        color: #1a202c;
        margin-left: 4px;
      }
    `,
  ],
})
export class LeaveKanbanComponent implements OnInit {
  kanbanService = inject(KanbanService);
  private leaveStore = inject(LeaveStore);
  router = inject(Router);

  isKanbanView = signal(true);

  connectedLists = ['pending', 'approved', 'rejected', 'cancelled'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.leaveStore.loadLeaveRequests();

    setTimeout(() => {
      const requests = this.leaveStore.leaveRequests();
      this.organizeToKanban(requests);
    }, 500);
  }

  organizeToKanban(requests: any[]): void {
    const columns: KanbanColumnConfig[] = [
      { id: 'pending', title: 'Pending', color: '#ff9800', items: [] },
      { id: 'approved', title: 'Approved', color: '#4caf50', items: [] },
      { id: 'rejected', title: 'Rejected', color: '#f44336', items: [] },
      { id: 'cancelled', title: 'Cancelled', color: '#9e9e9e', items: [] },
    ];

    requests.forEach((req) => {
      const column = columns.find((c) => c.id === req.status);
      if (column) {
        const item: KanbanItem = {
          id: req.id,
          title: req.employeeName || 'Unknown Employee',
          subtitle: req.reason || `${req.leaveType} - ${req.totalDays} days`,
          meta: [
            { label: 'Type', value: this.formatLeaveType(req.leaveType) },
            { label: 'Days', value: String(req.totalDays) },
            { label: 'From', value: this.formatDate(req.startDate) },
          ],
          color: this.getStatusColor(req.status),
          icon: 'event_busy',
        };
        column.items.push(item);
      }
    });

    this.kanbanService.organizeRequests(
      requests.map((r) => ({
        id: r.id,
        employeeId: r.employeeId || '',
        employeeName: r.employeeName || '',
        leaveType: r.leaveType || '',
        startDate: r.startDate,
        endDate: r.endDate,
        totalDays: r.totalDays || 0,
        reason: r.reason,
        status: r.status as LeaveStatus,
        createdAt: r.createdAt,
      })),
    );
  }

  kanbanColumns = signal<KanbanColumnConfig[]>([
    { id: 'pending', title: 'Pending', color: '#ff9800', items: [] },
    { id: 'approved', title: 'Approved', color: '#4caf50', items: [] },
    { id: 'rejected', title: 'Rejected', color: '#f44336', items: [] },
    { id: 'cancelled', title: 'Cancelled', color: '#9e9e9e', items: [] },
  ]);

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336',
      cancelled: '#9e9e9e',
    };
    return colors[status] || '#757575';
  }

  formatLeaveType(type: string): string {
    const types: Record<string, string> = {
      casual: 'Casual Leave',
      sick: 'Sick Leave',
      privileged: 'Privileged',
      work_from_home: 'WFH',
    };
    return types[type] || type;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  onItemDropped(event: {
    item: KanbanItem;
    previousColumn: string;
    currentColumn: string;
    previousIndex: number;
    currentIndex: number;
  }): void {
    console.log('Item dropped:', event);

    const statusMap: Record<string, LeaveStatus> = {
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected',
      cancelled: 'cancelled',
    };

    const newStatus = statusMap[event.currentColumn];
    const itemId = Number(event.item.id);
    if (newStatus && event.previousColumn !== event.currentColumn && !isNaN(itemId)) {
      switch (newStatus) {
        case 'approved':
          this.leaveStore.approveRequest(itemId).subscribe();
          break;
        case 'rejected':
          this.leaveStore.rejectRequest(itemId, 'Rejected via Kanban').subscribe();
          break;
        case 'cancelled':
          this.leaveStore.cancelRequest(itemId).subscribe();
          break;
      }
    }
  }

  onCardClicked(event: { item: KanbanItem; column: KanbanColumnConfig }): void {
    this.router.navigate(['/leave', event.item.id]);
  }

  onActionClicked(event: { event: Event; item: KanbanItem; action: string }): void {
    switch (event.action) {
      case 'view':
        this.router.navigate(['/leave', event.item.id]);
        break;
      case 'edit':
        this.router.navigate(['/leave/edit', event.item.id]);
        break;
    }
  }

  toggleView(): void {
    if (this.isKanbanView()) {
      this.router.navigate(['/leave/list']);
    } else {
      this.isKanbanView.set(true);
    }
  }
}
