import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { GradeListComponent } from './pages/grade-list/grade-list.component';
import { GradeFormComponent } from './pages/grade-form/grade-form.component';
import { PermissionGuard } from '../../../core/guards';
import { Permission } from '../../../core/models/rbac.models';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        component: GradeListComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.READ] } },
      },
      {
        path: 'add',
        component: GradeFormComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.CREATE] } },
      },
      {
        path: 'edit/:id',
        component: GradeFormComponent,
        canActivate: [PermissionGuard],
        data: { rbac: { permissions: [Permission.EDIT] } },
      },
    ],
  },
];

@NgModule({
  declarations: [GradeListComponent, GradeFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
  ],
})
export class GradeModule {}
