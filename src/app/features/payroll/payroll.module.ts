import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PayrollListComponent } from './pages/payroll-list/payroll-list.component';
import { PayrollRunComponent } from './pages/payroll-run/payroll-run.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: PayrollListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: ':id',
        component: PayrollRunComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [PayrollListComponent, PayrollRunComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
})
export class PayrollModule {}
