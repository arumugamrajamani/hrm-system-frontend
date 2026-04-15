import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceListComponent } from './pages/attendance-list/attendance-list.component';
import { AttendanceCalendarComponent } from './pages/attendance-calendar/attendance-calendar.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: AttendanceListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'calendar',
        component: AttendanceCalendarComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [AttendanceListComponent, AttendanceCalendarComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
})
export class AttendanceModule {}
