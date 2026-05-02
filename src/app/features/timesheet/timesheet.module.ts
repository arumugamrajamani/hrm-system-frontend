import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { TimesheetListComponent } from './pages/timesheet-list/timesheet-list.component';
import { TimesheetEntryComponent } from './pages/timesheet-entry/timesheet-entry.component';
import { TimesheetApprovalComponent } from './pages/timesheet-approval/timesheet-approval.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: TimesheetListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'create',
        component: TimesheetEntryComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.CREATE] } },
      },
      {
        path: 'edit/:id',
        component: TimesheetEntryComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.EDIT] } },
      },
      {
        path: ':id',
        component: TimesheetEntryComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'approval',
        component: TimesheetApprovalComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.EDIT] } },
      },
    ],
  },
];

@NgModule({
  declarations: [TimesheetListComponent, TimesheetEntryComponent, TimesheetApprovalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class TimesheetModule {}
