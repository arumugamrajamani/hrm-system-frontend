import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/components/dashboard-layout/dashboard-layout.component';
import { AuthGuard, GuestGuard } from './core/guards';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./user-management/user-management.module').then((m) => m.UserManagementModule),
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule),
      },
      {
        path: 'masters',
        loadChildren: () =>
          import('./features/masters/masters.module').then((m) => m.MastersModule),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employee/employee.module').then((m) => m.EmployeeModule),
      },
      {
        path: 'leave',
        loadChildren: () => import('./features/leave/leave.module').then((m) => m.LeaveModule),
      },
      {
        path: 'timesheet',
        loadChildren: () =>
          import('./features/timesheet/timesheet.module').then((m) => m.TimesheetModule),
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./features/attendance/attendance.module').then((m) => m.AttendanceModule),
      },
      {
        path: 'payroll',
        loadChildren: () =>
          import('./features/payroll/payroll.module').then((m) => m.PayrollModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then((m) => m.ReportsModule),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./shared/pages/notifications/notifications-page.module').then(
            (m) => m.NotificationsPageModule,
          ),
      },
      {
        path: 'onboarding',
        loadChildren: () =>
          import('./features/onboarding/onboarding.module').then((m) => m.OnboardingModule),
      },
      {
        path: 'approvals',
        loadChildren: () =>
          import('./features/approvals/approvals.module').then((m) => m.ApprovalsModule),
      },
      {
        path: 'audit',
        loadChildren: () => import('./features/audit/audit.module').then((m) => m.AuditModule),
      },
      {
        path: 'self-service',
        loadChildren: () =>
          import('./features/self-service/self-service.module').then((m) => m.SelfServiceModule),
      },
      {
        path: 'performance',
        loadChildren: () =>
          import('./features/performance/performance.module').then((m) => m.PerformanceModule),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
