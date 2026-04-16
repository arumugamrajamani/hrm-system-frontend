import { Injectable, signal, computed } from '@angular/core';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface KanbanColumn {
  id: LeaveStatus;
  title: string;
  color: string;
  items: LeaveRequest[];
}

@Injectable({ providedIn: 'root' })
export class KanbanService {
  private readonly _columns = signal<KanbanColumn[]>([
    { id: 'pending', title: 'Pending', color: '#ff9800', items: [] },
    { id: 'approved', title: 'Approved', color: '#4caf50', items: [] },
    { id: 'rejected', title: 'Rejected', color: '#f44336', items: [] },
    { id: 'cancelled', title: 'Cancelled', color: '#9e9e9e', items: [] },
  ]);

  readonly columns = this._columns.asReadonly();

  readonly columnStats = computed(() => {
    return this._columns().map((col) => ({
      id: col.id,
      title: col.title,
      count: col.items.length,
      color: col.color,
    }));
  });

  organizeRequests(requests: LeaveRequest[]): void {
    const organized: KanbanColumn[] = [
      { id: 'pending', title: 'Pending', color: '#ff9800', items: [] },
      { id: 'approved', title: 'Approved', color: '#4caf50', items: [] },
      { id: 'rejected', title: 'Rejected', color: '#f44336', items: [] },
      { id: 'cancelled', title: 'Cancelled', color: '#9e9e9e', items: [] },
    ];

    requests.forEach((request) => {
      const status = request.status;
      const column = organized.find((c) => c.id === status);
      if (column) {
        column.items.push(request);
      }
    });

    organized.forEach((col) => {
      col.items.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    this._columns.set(organized);
  }

  moveItem(
    item: LeaveRequest,
    fromStatus: LeaveStatus,
    toStatus: LeaveStatus,
    newIndex: number,
  ): void {
    this._columns.update((columns) => {
      const newColumns = columns.map((col) => ({
        ...col,
        items: [...col.items],
      }));

      const fromColumn = newColumns.find((c) => c.id === fromStatus);
      const toColumn = newColumns.find((c) => c.id === toStatus);

      if (!fromColumn || !toColumn) return columns;

      const itemIndex = fromColumn.items.findIndex((i) => i.id === item.id);
      if (itemIndex === -1) return columns;

      const [movedItem] = fromColumn.items.splice(itemIndex, 1);
      movedItem.status = toStatus;
      toColumn.items.splice(newIndex, 0, movedItem);

      return newColumns;
    });
  }

  getColumnItems(status: LeaveStatus): LeaveRequest[] {
    const column = this._columns().find((c) => c.id === status);
    return column?.items || [];
  }

  getItemById(id: string): LeaveRequest | undefined {
    for (const column of this._columns()) {
      const item = column.items.find((i) => i.id === id);
      if (item) return item;
    }
    return undefined;
  }
}
