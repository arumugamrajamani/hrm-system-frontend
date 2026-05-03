import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { SharedModule } from '../../shared/shared.module';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

import { GoalsListComponent } from './pages/goals-list/goals-list.component';
import { AppraisalCycleComponent } from './pages/appraisal-cycle/appraisal-cycle.component';
import { SelfRatingComponent } from './pages/self-rating/self-rating.component';
import { ManagerRatingComponent } from './pages/manager-rating/manager-rating.component';
import { RatingsComponent } from './pages/ratings/ratings.component';
import { CycleFormComponent } from './pages/cycle-form/cycle-form.component';
import { GoalFormComponent } from './pages/goal-form/goal-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'goals', pathMatch: 'full' },
  {
    path: 'goals',
    component: GoalsListComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'cycles',
    component: AppraisalCycleComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'self-rating',
    component: SelfRatingComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'self-rating/:cycleId/:employeeId',
    component: SelfRatingComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'manager-rating',
    component: ManagerRatingComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'manager-rating/:cycleId/:employeeId',
    component: ManagerRatingComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'ratings',
    component: RatingsComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.READ] } },
  },
  {
    path: 'cycles/create',
    component: CycleFormComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.CREATE] } },
  },
  {
    path: 'cycles/edit/:id',
    component: CycleFormComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.EDIT] } },
  },
  {
    path: 'goals/create',
    component: GoalFormComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.CREATE] } },
  },
  {
    path: 'goals/edit/:id',
    component: GoalFormComponent,
    canActivate: [PermissionGuard],
    data: { rbac: { permissions: [Permission.EDIT] } },
  },
];

@NgModule({
  declarations: [
    GoalsListComponent,
    AppraisalCycleComponent,
    SelfRatingComponent,
    ManagerRatingComponent,
    RatingsComponent,
    CycleFormComponent,
    GoalFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [PermissionGuard],
})
export class PerformanceModule {}
