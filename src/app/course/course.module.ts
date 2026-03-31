import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from '../core/models';
import { AuthGuard, PermissionGuard } from '../core/guards';
import { SharedModule } from '../shared/shared.module';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { CourseFormComponent } from './pages/course-form/course-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: CourseListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'add',
    component: CourseFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.CREATE] } },
  },
  {
    path: 'edit/:id',
    component: CourseFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.EDIT] } },
  },
];

@NgModule({
  declarations: [CourseListComponent, CourseFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class CourseModule {}
