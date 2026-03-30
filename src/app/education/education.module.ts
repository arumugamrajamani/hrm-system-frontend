import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { EducationListComponent } from './pages/education-list/education-list.component';
import { EducationFormComponent } from './pages/education-form/education-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: EducationListComponent },
  { path: 'add', component: EducationFormComponent },
  { path: 'edit/:id', component: EducationFormComponent },
];

@NgModule({
  declarations: [EducationListComponent, EducationFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
})
export class EducationModule {}
