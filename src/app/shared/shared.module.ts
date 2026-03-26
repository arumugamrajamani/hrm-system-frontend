import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToasterComponent } from './components/toaster/toaster.component';
import { ModalComponent } from './components/modal/modal.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { PasswordStrengthPipe } from './pipes/password-strength.pipe';
import { FocusDirective } from './directives/focus.directive';

@NgModule({
  declarations: [
    ToasterComponent,
    ModalComponent,
    DropdownComponent,
    AvatarComponent,
    PasswordStrengthPipe,
    FocusDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToasterComponent,
    ModalComponent,
    DropdownComponent,
    AvatarComponent,
    PasswordStrengthPipe,
    FocusDirective
  ]
})
export class SharedModule {}
