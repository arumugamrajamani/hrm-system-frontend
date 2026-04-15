import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
    children: [
      {
        path: 'departments',
        loadChildren: () =>
          import('./department/department.module').then((m) => m.DepartmentModule),
      },
      {
        path: 'designations',
        loadChildren: () =>
          import('./designation/designation.module').then((m) => m.DesignationModule),
      },
      {
        path: 'locations',
        loadChildren: () => import('./location/location.module').then((m) => m.LocationModule),
      },
      { path: '', redirectTo: 'departments', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MastersRoutingModule {}
