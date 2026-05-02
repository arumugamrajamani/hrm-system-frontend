import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeFormComponent } from './pages/employee-form/employee-form.component';
import { EmployeeProfileComponent } from './pages/employee-profile/employee-profile.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: EmployeeListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'add',
        component: EmployeeFormComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.CREATE] } },
      },
      {
        path: 'edit/:id',
        component: EmployeeFormComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.EDIT] } },
      },
      {
        path: 'view/:id',
        component: EmployeeProfileComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: ':id',
        component: EmployeeProfileComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [EmployeeListComponent, EmployeeFormComponent, EmployeeProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    SharedModule,
  ],
})
export class EmployeeModule {}
