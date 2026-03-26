import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  stats = signal([
    { title: 'Total Employees', value: '1,234', icon: 'fa-users', color: 'blue', change: '+12%' },
    { title: 'Active Projects', value: '56', icon: 'fa-briefcase', color: 'green', change: '+8%' },
    { title: 'Pending Tasks', value: '89', icon: 'fa-tasks', color: 'orange', change: '-5%' },
    { title: 'New Applications', value: '23', icon: 'fa-file-alt', color: 'purple', change: '+18%' }
  ]);

  recentActivities = signal([
    { user: 'John Doe', action: 'joined the team', time: '2 hours ago', avatar: 'JD' },
    { user: 'Jane Smith', action: 'completed onboarding', time: '4 hours ago', avatar: 'JS' },
    { user: 'Mike Johnson', action: 'submitted leave request', time: '6 hours ago', avatar: 'MJ' },
    { user: 'Sarah Wilson', action: 'updated profile', time: '1 day ago', avatar: 'SW' }
  ]);

  ngOnInit(): void {}

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
