import { Component, inject, signal, Output, EventEmitter, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenuItem } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isCollapsedState = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-th-large', route: '/dashboard' },
    { label: 'Users', icon: 'fa-users', route: '/user-management' },
    { label: 'Roles', icon: 'fa-user-shield', route: '/roles' },
    { label: 'Settings', icon: 'fa-cog', route: '/settings' }
  ];

  ngOnInit(): void {
    this.isCollapsedState.set(this.isCollapsed);
  }

  toggleCollapse(): void {
    this.isCollapsedState.update(v => !v);
    this.collapsedChange.emit(this.isCollapsedState());
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  hasAccess(roles: string[]): boolean {
    return this.authService.hasRole(roles);
  }

  editProfile(): void {
    this.router.navigate(['/profile']);
  }

  changePassword(): void {
    this.router.navigate(['/auth/reset-password']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
