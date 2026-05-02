import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApprovalsRoutingModule } from './routing/approvals-routing.module';
import { ApprovalInboxComponent } from './pages/approval-inbox/approval-inbox.component';
import { ApprovalHistoryComponent } from './pages/approval-history/approval-history.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';
import { SharedModule } from '../../shared/shared.module';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@NgModule({
  declarations: [ApprovalInboxComponent, ApprovalHistoryComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ApprovalsRoutingModule,
    SharedModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
})
export class ApprovalsModule {}
