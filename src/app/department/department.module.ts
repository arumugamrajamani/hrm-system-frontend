import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DepartmentRoutingModule } from './department-routing.module';
import { DepartmentListComponent } from './pages/department-list/department-list.component';
import { DepartmentFormComponent } from './pages/department-form/department-form.component';
import { DepartmentTableComponent } from './components/department-table/department-table.component';
import { DepartmentTreeComponent } from './components/department-tree/department-tree.component';

@NgModule({
  declarations: [
    DepartmentListComponent,
    DepartmentFormComponent,
    DepartmentTableComponent,
    DepartmentTreeComponent,
  ],
  imports: [
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DepartmentRoutingModule,
  ],
})
export class DepartmentModule {}
