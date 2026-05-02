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
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { SharedModule } from '../../shared/shared.module';
import { PermissionGuard } from '../../core/guards';
import { Permission } from '../../core/models/rbac.models';

import { EssDashboardComponent } from './pages/ess-dashboard/ess-dashboard.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { MyRequestsComponent } from './pages/my-requests/my-requests.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: EssDashboardComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [Permission.READ] },
  },
  {
    path: 'profile',
    component: MyProfileComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [Permission.READ] },
  },
  {
    path: 'requests',
    component: MyRequestsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [Permission.READ] },
  },
];

@NgModule({
  declarations: [EssDashboardComponent, MyProfileComponent, MyRequestsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [PermissionGuard],
})
export class SelfServiceModule {}
