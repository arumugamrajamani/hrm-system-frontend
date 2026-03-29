# Department Module - Quick Start Guide

## Setup (5 minutes)

### Step 1: Copy Module

Copy the `department/` folder to `src/app/`

### Step 2: Update Routing

Add to your `app-routing-module.ts`:

```typescript
{
  path: 'department',
  loadChildren: () => import('./department/department.module').then(m => m.DepartmentModule)
}
```

### Step 3: Update Environment

Add to `environment.ts`:

```typescript
departmentsApiUrl: 'http://localhost:3000/api/departments';
```

### Step 4: Update App Module

Import `DepartmentModule` or ensure lazy loading is set up

## Ready to Use!

Navigate to:

- `/department/list` - View all departments
- `/department/add` - Add new department
- `/department/edit/:id` - Edit department

## Features Overview

| Feature   | Route                  | Description                                 |
| --------- | ---------------------- | ------------------------------------------- |
| List View | `/department/list`     | Table with search, filter, sort, pagination |
| Tree View | `/department/list`     | Hierarchical organization display           |
| Add Form  | `/department/add`      | Create new department                       |
| Edit Form | `/department/edit/:id` | Update existing department                  |

## API Endpoints Required

```
GET    /api/departments         - List (paginated)
GET    /api/departments/:id     - Get one
POST   /api/departments         - Create
PUT    /api/departments/:id     - Update
DELETE /api/departments/:id     - Delete
GET    /api/departments/all     - All (for tree)
GET    /api/departments/check-name    - Validate name
GET    /api/departments/check-code    - Validate code
```

## Key Components

### DepartmentListComponent

- Search bar
- Status filter (All/Active/Inactive)
- View toggle (Table/Tree)
- Pagination controls
- Add button

### DepartmentFormComponent

- Reactive form
- Name & Code fields (required, unique)
- Parent department dropdown
- Description textarea
- Status toggle
- Inline validation

### DepartmentTableComponent

- Material Table
- Sortable columns
- Action buttons (Edit/Delete)
- Responsive design
- Empty state

### DepartmentTreeComponent

- Collapsible tree nodes
- Visual hierarchy
- Status badges
- Expand/collapse all

## Quick Customization

### Add Navigation Link

```html
<a routerLink="/department/list" class="nav-link"> <i class="fas fa-building"></i> Departments </a>
```

### Trigger Data Refresh

```typescript
import { DepartmentService } from './department/services/department.service';

constructor(private deptService: DepartmentService) {}

refreshDepartments() {
  this.deptService.triggerRefresh();
}
```

### Get Department Data

```typescript
this.deptService.getDepartment(id).subscribe((dept) => {
  console.log(dept);
});
```

## Responsive Breakpoints

- **Desktop (>1200px)**: Full table with all columns
- **Tablet (768-1200px)**: Scrollable table
- **Mobile (<768px)**: Stacked layout, simplified table

## Color Scheme

Uses Bootstrap 5 colors:

- Primary: `#0d6efd` (Blue)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)
- Warning: `#fd7e14` (Orange)

## Icons

FontAwesome 7 icons used:

- `fa-building` - Department
- `fa-pencil-alt` - Edit
- `fa-trash` - Delete
- `fa-search` - Search
- `fa-filter` - Filter
- `fa-table` - Table view
- `fa-sitemap` - Tree view
- `fa-plus` - Add
- `fa-times` - Cancel/Close

## Form Validation

✓ Required fields: Name, Code
✓ Unique constraints: Name, Code
✓ Parent validation: Cannot select self
✓ Real-time async validation
✓ Inline error messages
✓ Form state feedback

## Browser Support

✓ Chrome (latest)
✓ Firefox (latest)
✓ Safari (latest)
✓ Edge (latest)

## Performance

✓ Lazy loaded module
✓ Debounced search (300ms)
✓ OnPush change detection ready
✓ Optimized re-renders

## Testing

Run tests:

```bash
ng test
```

Build for production:

```bash
ng build
```

Serve locally:

```bash
ng serve
```

## Need Help?

1. Check `README.md` for detailed documentation
2. Review `INTEGRATION.md` for setup guide
3. Examine component source code
4. Test with mock API first

## Module Dependencies

- Angular 21+
- Angular Material 21+
- Bootstrap 5.3+
- FontAwesome 7+
- RxJS 7.8+

## Support

For issues: Check console logs, verify API connectivity, ensure all dependencies are installed.
