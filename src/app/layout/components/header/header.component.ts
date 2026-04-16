import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();

  private commandPalette = inject(CommandPaletteService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentDate = new Date();
  formattedDate = this.formatDate(this.currentDate);

  private formatDate(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  openCommandPalette(): void {
    this.commandPalette.open();
  }

  onNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);

    if (notification.action?.params) {
      const params = notification.action.params;
      if (params['route']) {
        this.router.navigate([params['route']]);
      }
    }
  }

  onViewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
