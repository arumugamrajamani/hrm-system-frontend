import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportsListComponent } from './pages/reports-list/reports-list.component';
import { DashboardWidgetsComponent } from './pages/dashboard-widgets/dashboard-widgets.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: ReportsListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'analytics',
        component: DashboardWidgetsComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [ReportsListComponent, DashboardWidgetsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
})
export class ReportsModule {}
