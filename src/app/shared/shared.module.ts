import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ToasterComponent } from './components/toaster/toaster.component';
import { ModalComponent } from './components/modal/modal.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { PasswordStrengthPipe } from './pipes/password-strength.pipe';
import { FocusDirective } from './directives/focus.directive';
import { HasPermissionDirective, HasRoleDirective } from './directives/has-permission.directive';

@NgModule({
  declarations: [
    DropdownComponent,
    AvatarComponent,
    PasswordStrengthPipe,
    FocusDirective,
    HasPermissionDirective,
    HasRoleDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    ToasterComponent,
    ModalComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    ToasterComponent,
    ModalComponent,
    DropdownComponent,
    AvatarComponent,
    PasswordStrengthPipe,
    FocusDirective,
    HasPermissionDirective,
    HasRoleDirective,
  ],
})
export class SharedModule {}
