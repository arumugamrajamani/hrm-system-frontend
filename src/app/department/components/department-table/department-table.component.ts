import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { Department } from '../../models/department.model';
import { ModalService } from '../../../core/services';

@Component({
  selector: 'app-department-table',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './department-table.component.html',
  styleUrls: ['./department-table.component.scss'],
})
export class DepartmentTableComponent implements AfterViewInit, OnDestroy {
  private _departments: Department[] = [];
  private _pageSize: number = 10;
  private _totalElements: number = 0;
  private _currentPage: number = 1;

  @Input()
  set departments(value: Department[]) {
    this._departments = value;
    this.dataSource.data = value;
    this.syncPaginator();
    this.cdr.markForCheck();
  }
  get departments(): Department[] {
    return this._departments;
  }

  @Input()
  set pageSize(value: number) {
    this._pageSize = value;
    this.syncPaginator();
    this.cdr.markForCheck();
  }
  get pageSize(): number {
    return this._pageSize;
  }

  @Input()
  set totalElements(value: number) {
    this._totalElements = value;
    this.syncPaginator();
    this.cdr.markForCheck();
  }
  get totalElements(): number {
    return this._totalElements;
  }

  @Input()
  set currentPage(value: number) {
    this._currentPage = value;
    this.syncPaginator();
    this.cdr.markForCheck();
  }
  get currentPage(): number {
    return this._currentPage;
  }
  @Output() edit = new EventEmitter<Department>();
  @Output() delete = new EventEmitter<Department>();
  @Output() page = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sort = new EventEmitter<{ active: string; direction: string }>();

  @ViewChild(MatSort) sortDir!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    'department_name',
    'department_code',
    'parent_department_name',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Department>([]);

  constructor(
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sortDir;
    this.dataSource.paginator = this.paginator;
    this.syncPaginator();
  }

  private syncPaginator(): void {
    if (!this.paginator) return;

    if (this.paginator.length !== this.totalElements) {
      this.paginator.length = this.totalElements;
    }

    const expectedIndex = this.currentPage - 1;
    if (this.paginator.pageIndex !== expectedIndex) {
      this.paginator.pageIndex = expectedIndex;
    }

    if (this.paginator.pageSize !== this.pageSize) {
      this.paginator.pageSize = this.pageSize;
    }
  }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  onEdit(department: Department): void {
    this.edit.emit(department);
  }

  async onDelete(department: Department): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Department',
      `Are you sure you want to delete "${department.department_name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.delete.emit(department);
    }
  }

  onPageChange(event: PageEvent): void {
    this.page.emit({
      pageIndex: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
    this.cdr.markForCheck();
  }

  onSortChange(event: any): void {
    this.sort.emit({
      active: event.active,
      direction: event.direction,
    });
  }
}
