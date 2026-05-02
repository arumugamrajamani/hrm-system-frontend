import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/guards';
import { Permission } from '../../../core/models/rbac.models';
import { ApprovalInboxComponent } from '../pages/approval-inbox/approval-inbox.component';
import { ApprovalHistoryComponent } from '../pages/approval-history/approval-history.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
    children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full' },
      {
        path: 'inbox',
        component: ApprovalInboxComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'pending',
        component: ApprovalInboxComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'history',
        component: ApprovalHistoryComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ApprovalsRoutingModule {}
