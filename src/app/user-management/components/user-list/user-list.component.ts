import { Component, inject, signal, OnInit, computed, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { UserApiService } from '../../services';
import { User } from '../../../core/models';
import { ToasterService, ModalService } from '../../../core/services';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private userApi = inject(UserApiService);
  private toaster = inject(ToasterService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (!paginator) return;
    this.paginator = paginator;
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    if (!sort) return;
    this.sort = sort;
    this.dataSource.sort = sort;
  }

  private paginator?: MatPaginator;
  private sort?: MatSort;

  users = signal<User[]>([]);
  isLoading = signal(false);
  searchTerm = '';
  searchType = 'all';
  editingPhotoUserId = signal<number | null>(null);
  displayedColumns: string[] = [
    'username',
    'email',
    'mobile',
    'role',
    'status',
    'createdAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<User>();

  pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  sortField = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  private readonly defaultSortField = 'createdAt';
  private readonly sortFieldMap: Record<string, string> = {
    username: 'username',
    email: 'email',
    role: 'role_id',
    role_id: 'role_id',
    status: 'status',
    createdAt: 'createdAt',
  };

  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'User' },
  ];

  displayedPages = computed(() => {
    const total = this.pagination().totalPages;
    const current = this.pagination().page;
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        for (let i = current - 2; i <= current + 2; i++) pages.push(i);
      }
    }

    return pages;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const paginationSignal = this.pagination();
    const pagination = paginationSignal
      ? { page: paginationSignal.page || 1, limit: paginationSignal.limit || 10 }
      : { page: 1, limit: 10 };
    let searchValue = this.searchTerm;
    console.log('loadUsers - pagination:', pagination);

    this.userApi
      .getUsers({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: this.getApiSortField(this.sortField()),
        sortOrder: this.sortOrder(),
        search: searchValue || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.users.set(response.data);
          this.dataSource.data = response.data;
          this.pagination.set({
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
          });
          if (this.paginator) {
            this.paginator.length = response.total;
            this.paginator.pageIndex = response.page - 1;
            this.paginator.pageSize = response.limit;
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.toaster.error('Error', 'Failed to load users');
        },
      });
  }

  onSearch(): void {
    console.log(
      'Search clicked - searchTerm:',
      this.searchTerm,
      'searchType:',
      this.searchType,
      'pagination:',
      this.pagination(),
    );
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    console.log('onSortChange:', sort);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    if (sort.direction) {
      this.sortField.set(this.getApiSortField(sort.active));
      this.sortOrder.set(sort.direction);
    } else {
      this.sortField.set(this.defaultSortField);
      this.sortOrder.set('desc');
    }
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    console.log('onPageChange:', event);
    this.pagination.update((p) => ({
      ...p,
      page: event.pageIndex + 1,
      limit: event.pageSize,
    }));
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages) {
      this.pagination.update((p) => ({ ...p, page }));
      this.loadUsers();
    }
  }

  editUser(user: User): void {
    this.router.navigate(['/user-management/edit', user.id]);
  }

  addUser(): void {
    this.router.navigate(['/user-management/add']);
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete User',
      `Are you sure you want to delete "${user.username}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.userApi.deleteUser(user.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.toaster.success('Success', 'User deleted successfully');
            this.loadUsers();
          }
        },
        error: () => {
          this.toaster.error('Error', 'Failed to delete user');
        },
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'status-active',
      inactive: 'status-inactive',
      pending: 'status-pending',
    };
    return classes[status] || 'status-inactive';
  }

  getRoleName(roleId: number | undefined): string {
    if (!roleId) return 'User';
    const role = this.roles.find((r) => r.id === roleId);
    return role ? role.name : 'User';
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return 'fa-sort';
    return this.sortOrder() === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  private getApiSortField(field: string): string {
    return this.sortFieldMap[field] || field || this.defaultSortField;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onEditPhotoClick(userId: number): void {
    this.editingPhotoUserId.set(userId);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.updateProfilePhoto(userId, target.files[0]);
      }
    };
    input.click();
  }

  private updateProfilePhoto(userId: number, file: File): void {
    const formData = new FormData();
    formData.append('profile_photo', file);

    this.userApi.updateUserWithFile(userId, formData).subscribe({
      next: (response) => {
        this.editingPhotoUserId.set(null);
        if (response.success) {
          this.toaster.success('Success', 'Profile photo updated successfully');
          this.loadUsers();
        } else {
          this.toaster.error('Error', response.message || 'Failed to update photo');
        }
      },
      error: () => {
        this.editingPhotoUserId.set(null);
        this.toaster.error('Error', 'Failed to update profile photo');
      },
    });
  }
}
