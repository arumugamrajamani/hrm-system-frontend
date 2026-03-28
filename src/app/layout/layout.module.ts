import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';

@NgModule({
  declarations: [SidebarComponent, HeaderComponent, DashboardLayoutComponent],
  imports: [SharedModule],
  exports: [SidebarComponent, HeaderComponent, DashboardLayoutComponent],
})
export class LayoutModule {}
