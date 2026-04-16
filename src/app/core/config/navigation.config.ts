import { MenuItemConfig, Permission, Role } from '../models/rbac.models';

export const APP_NAVIGATION_ITEMS: MenuItemConfig[] = [
  {
    label: 'Dashboard',
    icon: 'fa-th-large',
    route: '/dashboard',
    permissions: [Permission.READ],
  },
  {
    label: 'Employees',
    icon: 'fa-id-card',
    route: '/employees',
    permissions: [Permission.READ],
  },
  {
    label: 'Leave',
    icon: 'fa-calendar-minus',
    children: [
      {
        label: 'Leave Requests',
        icon: 'fa-list',
        route: '/leave',
        permissions: [Permission.READ],
      },
      {
        label: 'Kanban Board',
        icon: 'fa-columns',
        route: '/leave/kanban',
        permissions: [Permission.READ],
      },
      {
        label: 'Leave Balances',
        icon: 'fa-coins',
        route: '/leave/balances',
        permissions: [Permission.READ],
      },
      {
        label: 'Leave Policies',
        icon: 'fa-cog',
        route: '/leave/policies',
        permissions: [Permission.READ],
      },
    ],
  },
  {
    label: 'Timesheet',
    icon: 'fa-clock',
    route: '/timesheet',
    permissions: [Permission.READ],
  },
  {
    label: 'Attendance',
    icon: 'fa-user-clock',
    route: '/attendance',
    permissions: [Permission.READ],
  },
  {
    label: 'Payroll',
    icon: 'fa-money-bill-wave',
    route: '/payroll',
    permissions: [Permission.READ],
  },
  {
    label: 'Reports',
    icon: 'fa-chart-bar',
    route: '/reports',
    permissions: [Permission.READ],
  },
  {
    label: 'Users',
    icon: 'fa-users',
    route: '/user-management',
    permissions: [Permission.READ],
  },
  {
    label: 'Masters',
    icon: 'fa-folder-open',
    children: [
      {
        label: 'Departments',
        icon: 'fa-building',
        route: '/masters/departments',
        permissions: [Permission.READ],
      },
      {
        label: 'Designations',
        icon: 'fa-briefcase',
        route: '/masters/designations',
        permissions: [Permission.READ],
      },
      {
        label: 'Locations',
        icon: 'fa-map-marker-alt',
        route: '/masters/locations',
        permissions: [Permission.READ],
      },
      {
        label: 'Educations',
        icon: 'fa-graduation-cap',
        route: '/masters/educations',
        permissions: [Permission.READ],
      },
      {
        label: 'Courses',
        icon: 'fa-book',
        route: '/masters/courses',
        permissions: [Permission.READ],
      },
      {
        label: 'Education-Course Mapping',
        icon: 'fa-link',
        route: '/masters/education-course-mapping',
        permissions: [Permission.READ],
      },
    ],
  },
  {
    label: 'Settings',
    icon: 'fa-cog',
    route: '/settings',
    roles: [Role.SUPERADMIN, Role.ADMIN],
  },
];
