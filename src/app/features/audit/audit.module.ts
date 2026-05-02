import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuditLogListComponent } from './pages/audit-log-list/audit-log-list.component';
import { PermissionGuard } from '../../core/guards';
import { Permission, Role } from '../../core/models/rbac.models';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ], roles: [Role.SUPERADMIN, Role.ADMIN] } },
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: AuditLogListComponent,
        data: { rbac: { permissions: [Permission.READ] } },
      },
    ],
  },
];

@NgModule({
  declarations: [AuditLogListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatExpansionModule,
  ],
})
export class AuditModule {}
