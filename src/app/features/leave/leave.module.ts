import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveListComponent } from './pages/leave-list/leave-list.component';
import { LeaveRequestComponent } from './pages/leave-request/leave-request.component';
import { LeavePoliciesComponent } from './pages/leave-policies/leave-policies.component';
import { LeaveBalancesComponent } from './pages/leave-balances/leave-balances.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: LeaveListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'apply',
        component: LeaveRequestComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.CREATE] } },
      },
      {
        path: 'edit/:id',
        component: LeaveRequestComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.EDIT] } },
      },
      {
        path: ':id',
        component: LeaveRequestComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'policies',
        component: LeavePoliciesComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'balances',
        component: LeaveBalancesComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [
    LeaveListComponent,
    LeaveRequestComponent,
    LeavePoliciesComponent,
    LeaveBalancesComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule],
})
export class LeaveModule {}
