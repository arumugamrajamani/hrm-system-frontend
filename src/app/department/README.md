# Department Management Module

A comprehensive, scalable Department Management module for Angular HRM systems with clean architecture, reusable components, and responsive UI design.

## Features

- **Department List**: View all departments in a table with pagination, sorting, search, and filtering
- **Hierarchy View**: Visual tree view of department relationships
- **Add/Edit Department**: Reactive forms with comprehensive validation
- **Delete Department**: Confirmation modal with safe delete operations
- **Parent-Child Relationships**: Support for hierarchical department structures
- **Status Management**: Active/Inactive toggle for departments
- **Async Validation**: Real-time uniqueness checking for department names and codes
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5

## Module Structure

```
department/
├── pages/
│   ├── department-list/
│   │   └── department-list.component.ts
│   └── department-form/
│       └── department-form.component.ts
├── components/
│   ├── department-table/
│   │   └── department-table.component.ts
│   └── department-tree/
│       └── department-tree.component.ts
├── services/
│   ├── department.service.ts
│   └── department-api.service.ts
├── models/
│   └── department.model.ts
├── department-routing.module.ts
└── department.module.ts
```

## Components

### DepartmentListComponent

Main list page with:

- Table view with sorting and pagination (Material Table)
- Tree view for hierarchy visualization
- Search by name/code
- Filter by status (All/Active/Inactive)
- Quick actions (Edit/Delete)

### DepartmentFormComponent

Add/Edit form with:

- Reactive Forms validation
- Department name (required, unique)
- Department code (required, unique)
- Parent department (dropdown with disabled self-reference)
- Description (optional)
- Status toggle (Active/Inactive)
- Inline validation errors
- Async validation for duplicates

### DepartmentTableComponent

Reusable table component featuring:

- Material Table with sorting
- Pagination controls
- Action buttons (Edit/Delete)
- Responsive design
- Hover effects

### DepartmentTreeComponent

Hierarchical tree view with:

- Expandable/collapsible nodes
- Visual parent-child relationships
- Status indicators
- Department codes

## Services

### DepartmentService

Business logic layer with:

- CRUD operations
- Data caching and refresh triggers
- Tree building algorithms
- Error handling

### DepartmentApiService

API communication layer with:

- HTTP calls to backend
- Pagination parameter handling
- Search and filter parameters
- Unique field validation

## API Endpoints

The module expects the following backend API endpoints:

- `GET /api/departments` - List departments with pagination
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `GET /api/departments/all` - Get all departments (for tree/hierarchy)
- `GET /api/departments/check-name` - Check name uniqueness
- `GET /api/departments/check-code` - Check code uniqueness

## API Response Format

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Data Model

```typescript
interface Department {
  id?: number;
  department_name: string;
  department_code: string;
  parent_department_id?: number;
  parent_department_name?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}
```

## Routes

- `/department` - Department module root
- `/department/list` - Department list view
- `/department/add` - Add new department
- `/department/edit/:id` - Edit existing department

## Usage

### Import the module in your routing configuration:

```typescript
// app-routing-module.ts
{
  path: 'department',
  loadChildren: () =>
    import('./department/department.module').then(m => m.DepartmentModule)
}
```

### Configure environment:

```typescript
// environment.ts
export const environment = {
  // ...
  departmentsApiUrl: 'http://localhost:3000/api/departments',
};
```

### Navigation:

```typescript
// Navigate to list
this.router.navigate(['/department/list']);

// Navigate to add
this.router.navigate(['/department/add']);

// Navigate to edit
this.router.navigate(['/department/edit', departmentId]);
```

## Features in Detail

### Search

- Real-time search as you type
- Searches both department name and code
- Debounced input to reduce API calls

### Filtering

- Filter by status: All, Active, Inactive
- Instant filter application
- Persists across pagination

### Sorting

- Sortable columns: Name, Code, Parent, Status
- Ascending/descending order
- Visual sort indicators

### Pagination

- Configurable page size (10, 25, 50, 100)
- Page navigation controls
- Total count display
- Jump to page functionality

### Validation

- **Required fields**: Name and Code
- **Unique constraints**: Async validation via API
- **Self-reference prevention**: Cannot select self as parent
- **Real-time feedback**: Inline error messages

### Error Handling

- Global HTTP interceptor for API errors
- Toast notifications for user feedback
- Modal dialogs for confirmations
- Loading states for async operations

## Dependencies

- Angular 21+
- Angular Material 21+
- Bootstrap 5.3+
- FontAwesome 7+
- RxJS 7+

## Integration Points

### Shared Components Used

- `ToasterComponent` - Success/error notifications
- `ModalComponent` - Confirmation dialogs
- `SharedModule` - Common directives and pipes

### Core Services Used

- `AuthGuard` - Route protection
- `ToasterService` - Toast notifications
- `ModalService` - Modal dialogs

## Best Practices

1. **Lazy Loading**: Module is lazy-loaded for better performance
2. **Reactive Forms**: Uses reactive forms for type safety and scalability
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Responsive Design**: Mobile-first approach with Bootstrap grid
5. **Clean Architecture**: Separation of concerns with services and components
6. **Type Safety**: Strong typing with TypeScript interfaces
7. **Observable Patterns**: RxJS for async operations and state management

## Future Enhancements

- Drag-and-drop tree reordering
- Bulk import/export departments
- Department merge functionality
- Audit trail for changes
- Custom field support
- Department-specific permissions
- Integration with organizational chart
- Department head assignment
- Budget tracking per department
- Employee count per department

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Internal HRM System Module
