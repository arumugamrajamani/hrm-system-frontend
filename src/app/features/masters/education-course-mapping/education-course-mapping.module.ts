import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Permission } from '../../../core/models';
import { AuthGuard, PermissionGuard } from '../../../core/guards';
import { SharedModule } from '../../../shared/shared.module';
import { MappingListComponent } from './pages/mapping-list/mapping-list.component';

const routes: Routes = [
  {
    path: '',
    component: MappingListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
];

@NgModule({
  declarations: [MappingListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
  ],
})
export class EducationCourseMappingModule {}
