import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MappingListComponent } from './pages/mapping-list/mapping-list.component';

const routes: Routes = [{ path: '', component: MappingListComponent }];

@NgModule({
  declarations: [MappingListComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
})
export class EducationCourseMappingModule {}
