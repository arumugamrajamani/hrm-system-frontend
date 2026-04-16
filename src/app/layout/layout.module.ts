import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { SkipLinkComponent } from '../shared/components/skip-link/skip-link.component';
import { OfflineIndicatorComponent } from '../shared/components/offline-indicator/offline-indicator.component';
import { CommandPaletteComponent } from '../shared/components/command-palette/command-palette.component';
import { ThemeToggleComponent } from '../shared/components/theme-toggle/theme-toggle.component';
import { AccessibilityMenuComponent } from '../shared/components/accessibility-menu/accessibility-menu.component';
import { NotificationCenterComponent } from '../shared/components/notification-center/notification-center.component';

@NgModule({
  declarations: [SidebarComponent, HeaderComponent, DashboardLayoutComponent],
  imports: [
    SharedModule,
    SkipLinkComponent,
    OfflineIndicatorComponent,
    CommandPaletteComponent,
    ThemeToggleComponent,
    AccessibilityMenuComponent,
    NotificationCenterComponent,
  ],
  exports: [
    SidebarComponent,
    HeaderComponent,
    DashboardLayoutComponent,
    SkipLinkComponent,
    OfflineIndicatorComponent,
    CommandPaletteComponent,
    ThemeToggleComponent,
    AccessibilityMenuComponent,
    NotificationCenterComponent,
  ],
})
export class LayoutModule {}
