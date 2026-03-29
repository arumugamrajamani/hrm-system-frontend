import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangePasswordComponent } from '../auth/components/change-password/change-password.component';

const routes: Routes = [
  { path: '', component: ProfileComponent },
  { path: 'change-password', component: ChangePasswordComponent },
];

@NgModule({
  declarations: [ProfileComponent, ChangePasswordComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ProfileModule {}
