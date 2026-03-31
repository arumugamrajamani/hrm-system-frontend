import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from '../core/models';
import { AuthGuard, PermissionGuard } from '../core/guards';
import { SharedModule } from '../shared/shared.module';
import { EducationListComponent } from './pages/education-list/education-list.component';
import { EducationFormComponent } from './pages/education-form/education-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: EducationListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'add',
    component: EducationFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.CREATE] } },
  },
  {
    path: 'edit/:id',
    component: EducationFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { rbac: { permissions: [Permission.EDIT] } },
  },
];

@NgModule({
  declarations: [EducationListComponent, EducationFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class EducationModule {}
