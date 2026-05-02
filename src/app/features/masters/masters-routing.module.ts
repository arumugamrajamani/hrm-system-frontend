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
      {
        path: 'companies',
        loadChildren: () => import('./company/company.module').then((m) => m.CompanyModule),
      },
      {
        path: 'grades',
        loadChildren: () => import('./grade/grade.module').then((m) => m.GradeModule),
      },
      {
        path: 'employment-types',
        loadChildren: () =>
          import('./employment-type/employment-type.module').then((m) => m.EmploymentTypeModule),
      },
      {
        path: 'shifts',
        loadChildren: () => import('./shift/shift.module').then((m) => m.ShiftModule),
      },
      {
        path: 'educations',
        loadChildren: () => import('./education/education.module').then((m) => m.EducationModule),
      },
      {
        path: 'courses',
        loadChildren: () => import('./course/course.module').then((m) => m.CourseModule),
      },
      {
        path: 'education-course-mapping',
        loadChildren: () =>
          import('./education-course-mapping/education-course-mapping.module').then(
            (m) => m.EducationCourseMappingModule,
          ),
      },
      { path: '', redirectTo: 'departments', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MastersRoutingModule {}
