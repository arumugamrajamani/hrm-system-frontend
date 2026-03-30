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
export class DepartmentTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() departments: Department[] = [];
  @Input() pageSize: number = 10;
  @Input() totalElements: number = 0;
  @Input() currentPage: number = 1;
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['departments']) {
      this.dataSource.data = this.departments;
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
  }

  onSortChange(event: any): void {
    this.sort.emit({
      active: event.active,
      direction: event.direction,
    });
  }
}
