# HRM System Frontend

An award-winning enterprise HRM application built with Angular, designed to handle **500K+ records** smoothly with modern features.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [New Features](#new-features)
  - [Command Palette](#1-command-palette)
  - [Theme System](#2-theme-system-darklight-mode)
  - [PWA Support](#3-pwa-support)
  - [Real-time Notifications](#4-real-time-notifications)
  - [Kanban Board](#5-kanban-board)
  - [Analytics Dashboard](#6-analytics-dashboard)
  - [Accessibility Features](#7-accessibility-features)
  - [Offline Indicator](#8-offline-indicator)
- [Shared Components](#shared-components)
- [Core Services](#core-services)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build

# Run tests
ng test
```

**Access:** `http://localhost:4200`

---

## Project Structure

```
src/app/
├── core/                       # Application core
│   ├── services/               # Singleton services
│   ├── models/                 # TypeScript interfaces
│   ├── interceptors/           # HTTP interceptors
│   ├── guards/                 # Route guards
│   └── pipes/                  # Global pipes
├── shared/                     # Reusable code
│   ├── components/             # Standalone UI components
│   ├── pages/                  # Shared pages
│   ├── directives/             # Custom directives
│   ├── pipes/                  # Custom pipes
│   └── utils/                  # Utility functions
├── features/                   # Feature modules
│   ├── department/
│   ├── leave/
│   ├── payroll/
│   ├── employee/
│   └── reports/
└── layout/                     # App shell
    ├── components/
    │   ├── header/
    │   ├── sidebar/
    │   └── dashboard-layout/
    └── layout.module.ts
```

---

## New Features

### 1. Command Palette

**Keyboard Shortcut:** `Ctrl + K` (or `Cmd + K` on Mac)

A powerful command palette for quick navigation and actions.

#### Features:

- Quick navigation to any page
- Action shortcuts (add employee, create department, etc.)
- Search filtering in real-time
- Keyboard navigation support

#### How to Use:

```
1. Press Ctrl + K anywhere in the app
2. Type to search commands
3. Press Enter or click to execute
4. Press Escape to close
```

#### Available Commands:

| Command                      | Shortcut | Description               |
| ---------------------------- | -------- | ------------------------- |
| Go to Dashboard              | G D      | Navigate to dashboard     |
| Go to Employees              | G E      | Navigate to employee list |
| Go to Department             | G D      | Navigate to department    |
| Go to Leave Management       | G L      | Navigate to leave         |
| **Go to Leave Kanban Board** | G K      | Navigate to kanban view   |
| Go to Payroll                | G P      | Navigate to payroll       |
| Go to Analytics Dashboard    | G A      | Navigate to analytics     |
| Add New Employee             | -        | Open employee form        |
| Add New Department           | -        | Open department form      |
| View Reports                 | -        | Navigate to reports       |
| Open Settings                | G S      | Navigate to settings      |
| Logout                       | -        | Sign out                  |

#### Implementation:

```typescript
// Register custom commands
import { CommandPaletteService } from './core/services';

@Component({...})
export class MyComponent {
  private commandPalette = inject(CommandPaletteService);

  ngOnInit() {
    this.commandPalette.addCommand({
      id: 'my-action',
      label: 'My Custom Action',
      icon: 'star',
      category: 'Custom',
      action: () => console.log('Action executed!')
    });
  }
}
```

---

### 2. Theme System (Dark/Light Mode)

**Toggle Location:** Header toolbar

#### Features:

- Light mode (default)
- Dark mode
- System preference detection
- Persistent preference in localStorage
- Smooth transitions

#### How to Use:

**Via UI:**

1. Click the theme toggle icon in the header
2. Select: Light | Dark | System

**Via Code:**

```typescript
import { ThemeService } from './core/services';

@Component({...})
export class MyComponent {
  private themeService = inject(ThemeService);

  setDarkMode() {
    this.themeService.setTheme('dark');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

**CSS Variables Available:**

```css
/* Light Mode (default) */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1a202c;
--text-secondary: #718096;
--border-color: #e2e8f0;

/* Dark Mode */
--bg-primary: #1a202c;
--bg-secondary: #2d3748;
--text-primary: #f7fafc;
--text-secondary: #a0aec0;
--border-color: #4a5568;
```

---

### 3. PWA Support

**Features:**

- Service Worker for offline support
- App manifest with icons
- Installable as desktop/mobile app
- Cache strategies for optimal performance

#### Installation:

**Desktop:**

1. Chrome/Edge: Click install icon in address bar
2. Or: Developer Tools → Application → Install

**Mobile:**

1. Open in Chrome/Safari
2. Tap "Add to Home Screen"

#### Offline Capabilities:

- Cached API responses
- Offline indicator banner
- Graceful degradation

#### Implementation:

```typescript
import { PwaService } from './core/services';

@Component({...})
export class MyComponent {
  private pwaService = inject(PwaService);

  async installApp() {
    const canInstall = await this.pwaService.promptToInstall();
    if (canInstall) {
      console.log('App installed!');
    }
  }
}
```

---

### 4. Real-time Notifications

**Location:** Bell icon in header → Notification Center

#### Features:

- WebSocket-ready architecture
- Multiple notification types (info, success, warning, error)
- Click-to-navigate actions
- Mark as read/unread
- Badge count in header
- Full notifications page at `/notifications`

#### Notification Types:

```typescript
type NotificationType = 'info' | 'success' | 'warning' | 'error';
```

#### How to Use:

**Display a toast notification:**

```typescript
import { NotificationService } from './core/services';

@Component({...})
export class MyComponent {
  private notificationService = inject(NotificationService);

  showSuccess() {
    this.notificationService.showSuccess('Record saved successfully!');
  }

  showError(message: string) {
    this.notificationService.showError(message);
  }
}
```

**Subscribe to real-time notifications:**

```typescript
this.notificationService.notifications$.subscribe((notification) => {
  console.log('New notification:', notification);
});
```

**Mark as read:**

```typescript
this.notificationService.markAsRead(notificationId);
this.notificationService.markAllAsRead();
```

---

### 5. Kanban Board

**Route:** `/leave/kanban`

A drag-and-drop kanban board for managing leave requests visually.

#### Features:

- Drag-and-drop between columns (Pending → Approved → Rejected → Cancelled)
- Real-time stats bar
- Quick actions menu per card
- Responsive design
- CDK drag-drop integration

#### Columns:

| Status    | Color  | Actions on Drop       |
| --------- | ------ | --------------------- |
| Pending   | Orange | Awaiting approval     |
| Approved  | Green  | Approved by manager   |
| Rejected  | Red    | Rejected by manager   |
| Cancelled | Gray   | Cancelled by employee |

#### How to Use:

**Navigation:**

- Via URL: `/leave/kanban`
- Via Command Palette: `Ctrl+K` → "Go to Leave Kanban Board"

**Drag & Drop:**

1. Grab any leave request card
2. Drag to desired status column
3. Card automatically updates via API
4. Stats bar updates in real-time

**Quick Actions (card menu):**

- View Details
- Edit
- Delete

#### Implementation:

```typescript
import { KanbanBoardComponent, KanbanColumnConfig, KanbanItem } from './shared/components';

@Component({
  imports: [KanbanBoardComponent],
  template: `
    <app-kanban-board
      [columns]="columns"
      (itemDropped)="onDrop($event)"
      (cardClicked)="onCardClick($event)"
    >
    </app-kanban-board>
  `,
})
export class MyKanbanPage {
  columns: KanbanColumnConfig[] = [
    { id: 'todo', title: 'To Do', color: '#3f51b5', items: [] },
    { id: 'in-progress', title: 'In Progress', color: '#ff9800', items: [] },
    { id: 'done', title: 'Done', color: '#4caf50', items: [] },
  ];

  onDrop(event: any) {
    // Handle item drop - update status via API
    this.api.updateStatus(event.item.id, event.currentColumn);
  }
}
```

---

### 6. Analytics Dashboard

**Route:** `/reports/analytics`

Comprehensive analytics with KPI cards and charts.

#### KPI Cards:

- Total Employees
- Total Departments
- Average Salary
- Leave Requests (this month)
- Attendance Rate
- Pending Approvals

#### Charts:

- Leave Distribution (Pie/Doughnut)
- Attendance Trends (Line Chart)
- Monthly Hires (Bar Chart)

#### Features:

- Real-time data from API
- Skeleton loading states
- Export to CSV/PDF
- Responsive layout
- Chart.js integration

#### How to Use:

**View Dashboard:**

- Navigate to `/reports/analytics`
- Or: Command Palette → "Go to Analytics Dashboard"

**Add a KPI Card:**

```typescript
import { KpiCardComponent, ChartCardComponent } from './shared/components';

@Component({
  imports: [KpiCardComponent, ChartCardComponent],
  template: `
    <app-kpi-card
      title="My Metric"
      [value]="1234"
      icon="trending_up"
      color="#4caf50"
      [change]="12.5"
      changeLabel="vs last month">
    </app-kpi-card>

    <app-chart-card title="Revenue">
      <canvas baseChart ...></canvas>
    </app-chart-card>
  `
})
```

---

### 7. Accessibility Features

**Location:** Header toolbar → Accessibility Menu

#### Features:

- Skip links for keyboard navigation
- High contrast mode
- Reduced motion preference
- Screen reader optimizations
- Focus indicators
- Font size adjustment

#### How to Enable:

**Via UI:**

1. Click accessibility icon in header
2. Toggle features as needed
3. Settings persist in localStorage

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous element |
| Enter | Activate focused element |
| Escape | Close modals/menus |
| Ctrl+K | Open command palette |
| ? | Show keyboard shortcuts |

#### WCAG 2.1 Compliance:

- Color contrast ratios ≥ 4.5:1
- Focus visible indicators
- ARIA labels on interactive elements
- Alt text for images
- Semantic HTML structure

---

### 8. Offline Indicator

**Location:** Top of page (shown when offline)

#### Features:

- Automatic detection via navigator.onLine
- Non-intrusive banner
- Retry button to check connection
- Persists cached data visibility

#### Visual:

```
┌─────────────────────────────────────────────────┐
│ ⚠️ You're offline. Some features may be limited. │
│                              [Retry Connection]  │
└─────────────────────────────────────────────────┘
```

---

## Shared Components

All components are **standalone** and can be imported directly.

### Table Components

| Component                 | Purpose             | Usage                             |
| ------------------------- | ------------------- | --------------------------------- |
| `GenericTableComponent`   | Reusable data table | For lists with sorting, filtering |
| `PaginationComponent`     | Page navigation     | With page size selector           |
| `ExportButtonComponent`   | Export data         | CSV, PDF, Excel formats           |
| `BulkActionsBarComponent` | Batch operations    | Select multiple → actions         |

```typescript
import { GenericTableComponent } from './shared/components';

@Component({
  imports: [GenericTableComponent],
  template: `
    <app-generic-table
      [data]="items"
      [columns]="columns"
      [loading]="loading"
      (sort)="onSort($event)"
      (rowClick)="onRowClick($event)">
    </app-generic-table>
  `
})
```

### Form Components

| Component                  | Purpose          | Usage                      |
| -------------------------- | ---------------- | -------------------------- |
| `SmartFormComponent`       | Dynamic forms    | Auto-generates from schema |
| `SearchFilterBarComponent` | Search & filters | With debounce support      |

### Feedback Components

| Component                  | Purpose              | Usage                         |
| -------------------------- | -------------------- | ----------------------------- |
| `LoadingSkeletonComponent` | Loading placeholders | Matches content shape         |
| `EmptyStateComponent`      | Empty data display   | Custom illustration + message |
| `ConfirmDialogComponent`   | Confirmation modal   | Yes/No actions                |
| `ToasterComponent`         | Toast notifications  | Success/Error/Info/Warning    |

```typescript
import { LoadingSkeletonComponent, EmptyStateComponent } from './shared/components';

@Component({
  imports: [LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    @if (loading) {
      <app-loading-skeleton [rows]="5" type="table"></app-loading-skeleton>
    } @else if (items.length === 0) {
      <app-empty-state
        icon="inbox"
        title="No data found"
        message="Try adjusting your filters">
      </app-empty-state>
    } @else {
      <!-- Your content -->
    }
  `
})
```

### Layout Components

| Component                    | Purpose                  | Usage                |
| ---------------------------- | ------------------------ | -------------------- |
| `SkipLinkComponent`          | Accessibility skip links | Hidden until focused |
| `ThemeToggleComponent`       | Theme switcher           | Light/Dark/System    |
| `AccessibilityMenuComponent` | A11y settings panel      | WCAG features        |

---

## Core Services

### Service Overview

| Service                 | Purpose                              |
| ----------------------- | ------------------------------------ |
| `BaseApiService`        | Generic CRUD operations with caching |
| `CacheInterceptor`      | HTTP response caching                |
| `RetryInterceptor`      | Auto-retry failed requests           |
| `AuthService`           | Authentication & user management     |
| `ThemeService`          | Dark/light mode management           |
| `PwaService`            | PWA installation & updates           |
| `NotificationService`   | Real-time notifications              |
| `CommandPaletteService` | Command registration & execution     |
| `KanbanService`         | Kanban board state management        |
| `AnalyticsService`      | Dashboard data & charts              |
| `StorageService`        | Local/session storage wrapper        |

### CacheInterceptor

Automatically caches GET requests. Configure in `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([cacheInterceptor, retryInterceptor]))],
};
```

### RetryInterceptor

Retries failed requests (default: 3 attempts):

```typescript
// Customize retry config
provideHttpClient(withInterceptors([retryInterceptor.configure({ maxRetries: 5, delay: 1000 })]));
```

---

## Best Practices

### 1. Standalone Components

Prefer standalone components for new code:

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  // ...
})
```

### 2. Signal-based State

Use Angular signals for reactive state:

```typescript
items = signal<Item[]>([]);
loading = signal(false);

// Computed values
filteredItems = computed(() => this.items().filter((i) => i.active));
```

### 3. Lazy Loading

All feature modules are lazy-loaded:

```typescript
{
  path: 'employees',
  loadChildren: () => import('./features/employee/employee.module')
    .then(m => m.EmployeeModule)
}
```

### 4. HTTP Caching

Cache strategy for optimal performance:

- Cache API responses for specified durations
- Automatic cache invalidation
- Storage-based caching (localStorage/sessionStorage)

### 5. Error Handling

Use interceptors for global error handling:

```typescript
// All HTTP errors handled centrally
// Toast notifications for user feedback
// Retry logic for transient failures
```

---

## Performance Optimization

### For 500K+ Records:

1. **Virtual Scrolling** - Use `cdk-virtual-scroll-viewport`
2. **Pagination** - Server-side pagination (default)
3. **Lazy Loading** - All feature modules lazy-loaded
4. **OnPush Change Detection** - Use `ChangeDetectionStrategy.OnPush`
5. **Memoization** - Use `computed()` for derived state
6. **Web Workers** - Heavy computations off main thread

### Example: Virtual Scroll

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
```

---

## Feature Status Summary

| Feature              | Status      | Route              |
| -------------------- | ----------- | ------------------ |
| Command Palette      | ✅ Complete | Ctrl+K             |
| Theme Toggle         | ✅ Complete | Header             |
| PWA Support          | ✅ Complete | -                  |
| Offline Indicator    | ✅ Complete | Auto               |
| Notifications        | ✅ Complete | /notifications     |
| Kanban Board         | ✅ Complete | /leave/kanban      |
| Analytics Dashboard  | ✅ Complete | /reports/analytics |
| Accessibility Menu   | ✅ Complete | Header             |
| Skip Links           | ✅ Complete | Auto               |
| Skeleton Loading     | ✅ Complete | All lists          |
| Empty States         | ✅ Complete | All lists          |
| Export Functionality | ✅ Complete | List pages         |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License
