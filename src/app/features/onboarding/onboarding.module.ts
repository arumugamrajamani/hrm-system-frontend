import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';

import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';
import { SharedModule } from '../../shared/shared.module';

import { OnboardingListComponent } from './pages/onboarding-list/onboarding-list.component';
import { OnboardingDetailComponent } from './pages/onboarding-detail/onboarding-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: OnboardingListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [Permission.READ] },
  },
  {
    path: ':id',
    component: OnboardingDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [Permission.READ] },
  },
  {
    path: 'templates',
    component: OnboardingListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [Permission.MANAGE] },
  },
];

@NgModule({
  declarations: [OnboardingListComponent, OnboardingDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatPaginatorModule,
  ],
  providers: [],
})
export class OnboardingModule {}
