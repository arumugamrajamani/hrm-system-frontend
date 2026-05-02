import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveListComponent } from './pages/leave-list/leave-list.component';
import { LeaveRequestComponent } from './pages/leave-request/leave-request.component';
import { LeavePoliciesComponent } from './pages/leave-policies/leave-policies.component';
import { LeaveBalancesComponent } from './pages/leave-balances/leave-balances.component';
import { LeaveKanbanComponent } from './pages/leave-kanban/leave-kanban.component';
import { LeaveAccrualsComponent } from './pages/leave-accruals/leave-accruals.component';
import { LeaveEncashmentComponent } from './pages/leave-encashment/leave-encashment.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';
import { SharedModule } from '../../shared/shared.module';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

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
        path: 'kanban',
        component: LeaveKanbanComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'edit/:id',
        component: LeaveRequestComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.EDIT] } },
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
      {
        path: 'accruals',
        component: LeaveAccrualsComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'encashment',
        component: LeaveEncashmentComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: ':id',
        component: LeaveRequestComponent,
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
    LeaveAccrualsComponent,
    LeaveEncashmentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    LeaveKanbanComponent,
  ],
})
export class LeaveModule {}
