import { MenuItemConfig, Permission, Role } from '../models/rbac.models';

export const APP_NAVIGATION_ITEMS: MenuItemConfig[] = [
  {
    label: 'Dashboard',
    icon: 'fa-th-large',
    route: '/dashboard',
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
        route: '/department',
        permissions: [Permission.READ],
      },
      {
        label: 'Educations',
        icon: 'fa-graduation-cap',
        route: '/educations',
        permissions: [Permission.READ],
      },
      {
        label: 'Courses',
        icon: 'fa-book',
        route: '/courses',
        permissions: [Permission.READ],
      },
      {
        label: 'Education-Course Mapping',
        icon: 'fa-link',
        route: '/education-course-mapping',
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
