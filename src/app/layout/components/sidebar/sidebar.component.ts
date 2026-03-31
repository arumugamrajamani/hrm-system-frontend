import {
  Component,
  inject,
  signal,
  computed,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RbacService } from '../../../core/services';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { UserApiService } from '../../../user-management/services';
import { User } from '../../../core/models';
import { APP_NAVIGATION_ITEMS } from '../../../core/config/navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() menuClicked = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private rbacService = inject(RbacService);
  private userApi = inject(UserApiService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isCollapsedState = signal(false);
  isUserMenuOpen = signal(false);
  expandedMenus = signal<Set<string>>(new Set(['Masters']));

  readonly menuItems = computed(() => this.rbacService.filterMenuByPermission(APP_NAVIGATION_ITEMS));

  ngOnInit(): void {
    this.isCollapsedState.set(this.isCollapsed);
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    const user = this.currentUser();
    if (user?.id) {
      this.userApi
        .getUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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

  toggleMasterMenu(menuLabel: string): void {
    const expanded = new Set(this.expandedMenus());
    if (expanded.has(menuLabel)) {
      expanded.delete(menuLabel);
    } else {
      expanded.add(menuLabel);
    }
    this.expandedMenus.set(expanded);
  }

  isMenuExpanded(menuLabel: string): boolean {
    return this.expandedMenus().has(menuLabel);
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
