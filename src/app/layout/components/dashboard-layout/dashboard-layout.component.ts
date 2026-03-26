import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToasterComponent } from '../../../shared/components/toaster/toaster.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AuthService, ModalService, ToasterService } from '../../../core/services';

@Component({
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  pageTitle = signal('Dashboard');

  ngOnInit(): void {
    this.updatePageTitle();
  }

  private updatePageTitle(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      if (url.includes('/dashboard')) {
        this.pageTitle.set('Dashboard');
      } else if (url.includes('/user-management')) {
        this.pageTitle.set('User Management');
      } else if (url.includes('/roles')) {
        this.pageTitle.set('Roles & Permissions');
      } else if (url.includes('/settings')) {
        this.pageTitle.set('Settings');
      }
    });
  }

  onSidebarToggle(isCollapsed: boolean): void {
    this.isSidebarCollapsed.set(isCollapsed);
  }

  onMobileMenuToggle(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
