import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-settings',
  standalone: false,
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <i class="fas fa-cog"></i>
        <h1>Settings</h1>
        <p>This module is under development.</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 120px);
      text-align: center;
    }
    
    .placeholder-content {
      i {
        font-size: 64px;
        color: #667eea;
        margin-bottom: 24px;
      }
      
      h1 {
        font-size: 28px;
        color: #2d3748;
        margin-bottom: 8px;
      }
      
      p {
        color: #718096;
      }
    }
  `]
})
export class SettingsComponent {}

const routes: Routes = [
  { path: '', component: SettingsComponent }
];

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SettingsModule {}
