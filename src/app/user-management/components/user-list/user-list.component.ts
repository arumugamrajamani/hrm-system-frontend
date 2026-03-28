import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../services';
import { User, PaginatedResponse } from '../../../core/models';
import { ToasterService, ModalService } from '../../../core/services';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

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

  users = signal<User[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  sortField = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

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

    this.userApi
      .getUsers({
        page: this.pagination().page,
        limit: this.pagination().limit,
        sortBy: this.sortField(),
        sortOrder: this.sortOrder(),
        search: this.searchTerm(),
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.users.set(response.data);
          this.pagination.set({
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
          });
        },
        error: () => {
          this.isLoading.set(false);
          this.toaster.error('Error', 'Failed to load users');
        },
      });
  }

  onSearch(): void {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadUsers();
  }

  onSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.update((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
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

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
