import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { PayrollListComponent } from './pages/payroll-list/payroll-list.component';
import { PayrollRunComponent } from './pages/payroll-run/payroll-run.component';
import { SalaryComponentsComponent } from './pages/salary-components/salary-components.component';
import { PayrollEngineComponent } from './pages/payroll-engine/payroll-engine.component';
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
        component: PayrollListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'components',
        component: SalaryComponentsComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'engine',
        component: PayrollEngineComponent,
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
  declarations: [
    PayrollListComponent,
    PayrollRunComponent,
    SalaryComponentsComponent,
    PayrollEngineComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatGridListModule,
    SharedModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
})
export class PayrollModule {}
