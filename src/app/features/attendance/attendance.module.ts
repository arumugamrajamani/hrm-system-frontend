import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from '../../shared/shared.module';
import { AttendanceListComponent } from './pages/attendance-list/attendance-list.component';
import { AttendanceCalendarComponent } from './pages/attendance-calendar/attendance-calendar.component';
import { AttendanceRegularizationComponent } from './pages/attendance-regularization/attendance-regularization.component';
import { ShiftRosterComponent } from './pages/shift-roster/shift-roster.component';
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
      {
        path: 'regularization',
        component: AttendanceRegularizationComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'shift-roster',
        component: ShiftRosterComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [
    AttendanceListComponent,
    AttendanceCalendarComponent,
    AttendanceRegularizationComponent,
    ShiftRosterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SharedModule,
  ],
})
export class AttendanceModule {}
