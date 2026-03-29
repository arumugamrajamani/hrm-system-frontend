import { Component, inject, signal, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { UserApiService } from '../../../user-management/services';
import { User } from '../../../core/models';
import { Department } from '../../../department';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() menuClicked = new EventEmitter<void>();

  private authService = inject(AuthService);
  private userApi = inject(UserApiService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isCollapsedState = signal(false);
  isUserMenuOpen = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-th-large', route: '/dashboard' },
    { label: 'Users', icon: 'fa-users', route: '/user-management', permission: 'users.read' },
    { label: 'Departments', icon: 'fa-building', route: '/department' },
    { label: 'Settings', icon: 'fa-cog', route: '/settings' },
  ];

  ngOnInit(): void {
    this.isCollapsedState.set(this.isCollapsed);
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const user = this.currentUser();
    if (user?.id) {
      this.userApi.getUser(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.authService.updateUser(response.data as User);
          }
        },
        error: () => {},
      });
    }
  }

  toggleCollapse(): void {
    this.isCollapsedState.update((v) => !v);
    this.collapsedChange.emit(this.isCollapsedState());
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((v) => !v);
  }

  onMenuClick(): void {
    this.menuClicked.emit();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  hasAccess(permission?: string): boolean {
    if (!permission) return true;
    return this.authService.hasPermission(permission);
  }

  getProfilePhoto(): string | null {
    const user = this.currentUser();
    return user?.profile_photo || user?.avatar || null;
  }

  editProfile(): void {
    this.isUserMenuOpen.set(false);
    this.router.navigate(['/profile']);
  }

  changePassword(): void {
    this.isUserMenuOpen.set(false);
    this.router.navigate(['/profile/change-password']);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
