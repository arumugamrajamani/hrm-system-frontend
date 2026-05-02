import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToasterComponent } from '../../../shared/components/toaster/toaster.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SkipLinkComponent } from '../../../shared/components/skip-link/skip-link.component';
import { OfflineIndicatorComponent } from '../../../shared/components/offline-indicator/offline-indicator.component';
import { CommandPaletteComponent } from '../../../shared/components/command-palette/command-palette.component';
import {
  AuthService,
  ModalService,
  ToasterService,
  CommandPaletteService,
} from '../../../core/services';

@Component({
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  private commandPalette = inject(CommandPaletteService);

  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  pageTitle = signal('Dashboard');

  ngOnInit(): void {
    this.updatePageTitle();
    this.registerCommands();
  }

  private registerCommands(): void {
    this.commandPalette.registerCommands([
      {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        icon: 'dashboard',
        shortcut: 'G D',
        category: 'Navigation',
        action: () => this.router.navigate(['/dashboard']),
      },
      {
        id: 'nav-employees',
        label: 'Go to Employees',
        icon: 'people',
        shortcut: 'G E',
        category: 'Navigation',
        action: () => this.router.navigate(['/employees']),
      },
      {
        id: 'nav-department',
        label: 'Go to Department',
        icon: 'business',
        shortcut: 'G M',
        category: 'Navigation',
        action: () => this.router.navigate(['/masters/departments']),
      },
      {
        id: 'nav-attendance',
        label: 'Go to Attendance',
        icon: 'event_available',
        shortcut: 'G A',
        category: 'Navigation',
        action: () => this.router.navigate(['/attendance']),
      },
      {
        id: 'nav-leave',
        label: 'Go to Leave Management',
        icon: 'event_busy',
        shortcut: 'G L',
        category: 'Navigation',
        action: () => this.router.navigate(['/leave']),
      },
      {
        id: 'nav-leave-kanban',
        label: 'Go to Leave Kanban Board',
        icon: 'view_kanban',
        shortcut: 'G K',
        category: 'Navigation',
        action: () => this.router.navigate(['/leave/kanban']),
      },
      {
        id: 'nav-payroll',
        label: 'Go to Payroll',
        icon: 'payments',
        shortcut: 'G P',
        category: 'Navigation',
        action: () => this.router.navigate(['/payroll']),
      },
      {
        id: 'action-new-employee',
        label: 'Add New Employee',
        icon: 'person_add',
        category: 'Actions',
        action: () => this.router.navigate(['/employees/add']),
      },
      {
        id: 'action-new-department',
        label: 'Add New Department',
        icon: 'add_business',
        category: 'Actions',
        action: () => this.router.navigate(['/masters/departments/add']),
      },
      {
        id: 'action-reports',
        label: 'View Reports',
        icon: 'assessment',
        category: 'Actions',
        action: () => this.router.navigate(['/reports']),
      },
      {
        id: 'nav-analytics',
        label: 'Go to Analytics Dashboard',
        icon: 'analytics',
        shortcut: 'G R',
        category: 'Navigation',
        action: () => this.router.navigate(['/reports/analytics']),
      },
      {
        id: 'action-settings',
        label: 'Open Settings',
        icon: 'settings',
        shortcut: 'G S',
        category: 'Navigation',
        action: () => this.router.navigate(['/settings']),
      },
      {
        id: 'action-logout',
        label: 'Logout',
        icon: 'logout',
        category: 'Account',
        action: () => this.authService.logout(),
      },
    ]);
  }

  private updatePageTitle(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.url;
      if (url.includes('/dashboard')) {
        this.pageTitle.set('Dashboard');
      } else if (url.includes('/user-management')) {
        this.pageTitle.set('User Management');
      } else if (url.includes('/roles')) {
        this.pageTitle.set('Roles & Permissions');
      } else if (url.includes('/settings')) {
        this.pageTitle.set('Settings');
      } else if (url.includes('/employee')) {
        this.pageTitle.set('Employees');
      } else if (url.includes('/department')) {
        this.pageTitle.set('Department');
      } else if (url.includes('/attendance')) {
        this.pageTitle.set('Attendance');
      } else if (url.includes('/leave')) {
        this.pageTitle.set('Leave Management');
      } else if (url.includes('/payroll')) {
        this.pageTitle.set('Payroll');
      } else if (url.includes('/reports')) {
        this.pageTitle.set('Reports');
      }
    });
  }

  onSidebarToggle(isCollapsed: boolean): void {
    this.isSidebarCollapsed.set(isCollapsed);
  }

  onMobileMenuToggle(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
