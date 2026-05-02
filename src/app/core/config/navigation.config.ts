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
    label: 'Approvals',
    icon: 'fa-check-double',
    route: '/approvals',
    permissions: [Permission.READ],
  },
  {
    label: 'Audit Log',
    icon: 'fa-history',
    route: '/audit',
    permissions: [Permission.READ],
    roles: [Role.SUPERADMIN, Role.ADMIN],
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
        label: 'Companies',
        icon: 'fa-building',
        route: '/masters/companies',
        permissions: [Permission.READ],
      },
      {
        label: 'Departments',
        icon: 'fa-sitemap',
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
        label: 'Grades/Bands',
        icon: 'fa-layer-group',
        route: '/masters/grades',
        permissions: [Permission.READ],
      },
      {
        label: 'Employment Types',
        icon: 'fa-file-contract',
        route: '/masters/employment-types',
        permissions: [Permission.READ],
      },
      {
        label: 'Shifts',
        icon: 'fa-clock',
        route: '/masters/shifts',
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
    label: 'Self-Service',
    icon: 'fa-user-circle',
    children: [
      {
        label: 'Dashboard',
        icon: 'fa-tachometer-alt',
        route: '/self-service/dashboard',
        permissions: [Permission.READ],
      },
      {
        label: 'My Profile',
        icon: 'fa-id-badge',
        route: '/self-service/profile',
        permissions: [Permission.READ],
      },
      {
        label: 'My Requests',
        icon: 'fa-paper-plane',
        route: '/self-service/requests',
        permissions: [Permission.READ],
      },
    ],
  },
  {
    label: 'Performance',
    icon: 'fa-chart-line',
    children: [
      {
        label: 'Goals & KPIs',
        icon: 'fa-bullseye',
        route: '/performance/goals',
        permissions: [Permission.READ],
      },
      {
        label: 'Appraisal Cycles',
        icon: 'fa-clipboard-check',
        route: '/performance/appraisals',
        permissions: [Permission.READ],
      },
      {
        label: 'Training & Certifications',
        icon: 'fa-graduation-cap',
        route: '/performance/training',
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
