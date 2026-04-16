import { Injectable } from '@angular/core';

export interface WorkerTask<T = any> {
  id: string;
  type: string;
  payload: any;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

@Injectable({ providedIn: 'root' })
export class DataProcessorService {
  private worker: Worker | null = null;
  private pendingTasks = new Map<string, WorkerTask>();
  private taskIdCounter = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../../workers/data-processor.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        const task = this.pendingTasks.get(data.id);
        if (task) {
          this.pendingTasks.delete(data.id);
          if (data.type.endsWith('_RESULT')) {
            task.resolve(data.payload);
          } else if (data.type === 'ERROR') {
            task.reject(new Error(data.payload));
          }
        }
      };
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
    }
  }

  private generateTaskId(): string {
    return `task_${++this.taskIdCounter}_${Date.now()}`;
  }

  private postTask<T>(type: string, payload: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        console.warn('Web Workers not supported, falling back to main thread');
        reject(new Error('Web Workers not supported'));
        return;
      }

      const id = this.generateTaskId();
      this.pendingTasks.set(id, { id, type, payload, resolve, reject } as WorkerTask<T>);
      this.worker.postMessage({ id, type, payload });
    });
  }

  filter<T>(data: T[], filters: Record<string, any>): Promise<T[]> {
    return this.postTask<T[]>('FILTER', { data, filters });
  }

  sort<T>(data: T[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    return this.postTask<T[]>('SORT', { data, sortBy, sortOrder });
  }

  paginate<T>(
    data: T[],
    page: number,
    limit: number,
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.postTask('PAGINATE', { data, page, limit });
  }

  search<T>(data: T[], query: string, fields: string[]): Promise<T[]> {
    return this.postTask<T[]>('SEARCH', { data, query, fields });
  }

  aggregate<T>(
    data: T[],
    field: string,
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count',
  ): Promise<any> {
    return this.postTask('AGGREGATE', { data, field, operation });
  }

  groupBy<T>(data: T[], field: string): Promise<Record<string, T[]>> {
    return this.postTask<Record<string, T[]>>('GROUP_BY', { data, field });
  }

  exportToCsv<T>(data: T[], columns: { key: string; label: string }[]): Promise<string> {
    return this.postTask<string>('EXPORT_CSV', { data, columns });
  }

  processLargeDataset<T>(data: T[], operations: any[]): Promise<T[]> {
    return this.postTask<T[]>('PROCESS_LARGE_DATASET', { data, operations });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingTasks.clear();
    }
  }
}
