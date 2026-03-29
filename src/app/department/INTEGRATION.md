# Department Management Module - Integration Guide

This guide will help you integrate the Department Management module into your existing HRM Angular application.

## Prerequisites

Ensure you have the following dependencies in your project:

```json
{
  "@angular/core": "^21.0.0",
  "@angular/material": "^21.0.0",
  "@angular/cdk": "^21.0.0",
  "bootstrap": "^5.3.0",
  "@popperjs/core": "^2.11.8",
  "@fortawesome/fontawesome-free": "^7.0.0",
  "rxjs": "^7.8.0"
}
```

## Installation Steps

### 1. Copy the Module

Copy the entire `department/` folder to your Angular project's `src/app/` directory:

```
src/app/department/
├── pages/
│   ├── department-list/
│   └── department-form/
├── components/
│   ├── department-table/
│   └── department-tree/
├── services/
│   ├── department.service.ts
│   └── department-api.service.ts
├── models/
│   └── department.model.ts
├── department-routing.module.ts
├── department.module.ts
└── index.ts
```

### 2. Update Environment Configuration

Add the departments API URL to your environment file:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  usersApiUrl: 'http://localhost:3000/api/users',
  departmentsApiUrl: 'http://localhost:3000/api/departments', // Add this
  uploadsUrl: '/uploads',
  tokenKey: 'hrm_token',
  refreshTokenKey: 'hrm_refresh_token',
  tokenExpiryKey: 'hrm_token_expiry',
};
```

### 3. Update App Routing

Add the department module to your main routing configuration:

```typescript
// app-routing-module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // ... other routes

      // Add this:
      {
        path: 'department',
        loadChildren: () =>
          import('./department/department.module').then((m) => m.DepartmentModule),
      },
    ],
  },
  // ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

### 4. Ensure Shared Dependencies

The module relies on shared components. Verify your shared module has:

```typescript
// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ToasterComponent } from './components/toaster/toaster.component';
import { ModalComponent } from './components/modal/modal.component';
// ... other shared components

@NgModule({
  declarations: [
    ToasterComponent,
    ModalComponent,
    // ... other components
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    ToasterComponent,
    ModalComponent,
    // ... other components
  ],
})
export class SharedModule {}
```

### 5. Verify Core Services

Ensure you have the required core services:

- `ToasterService` - For notifications
- `ModalService` - For confirmation dialogs
- `AuthService` - For authentication
- `AuthGuard` - For route protection

### 6. Configure Bootstrap and FontAwesome

Add these to your `angular.json` or `index.html`:

```html
<!-- index.html -->
<head>
  <!-- Bootstrap CSS -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />

  <!-- FontAwesome -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.2.0/css/all.min.css"
  />
</head>
```

Or in angular.json:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "src/styles.scss"
],
```

## Backend API Requirements

### Expected Endpoints

The module expects the following RESTful API endpoints:

```
GET    /api/departments          - List with pagination
GET    /api/departments/:id      - Get single department
POST   /api/departments          - Create department
PUT    /api/departments/:id      - Update department
DELETE /api/departments/:id      - Delete department
GET    /api/departments/all      - Get all (for tree view)
GET    /api/departments/check-name?department_name=...&excludeId=...  - Check name
GET    /api/departments/check-code?department_code=...&excludeId=... - Check code
```

### API Response Format

```typescript
// Success response
{
  "success": true,
  "message": "Department created successfully",
  "data": { /* department object */ }
}

// Error response
{
  "success": false,
  "message": "Validation failed",
  "errors": { /* validation errors */ }
}

// Paginated response (for list endpoint)
{
  "data": [ /* array of departments */ ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Query Parameters for List Endpoint

```
GET /api/departments?page=1&limit=10&sortBy=name&sortOrder=asc&search=...&status=active
```

- `page` (required): Page number
- `limit` (required): Items per page
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): 'asc' or 'desc'
- `search` (optional): Search term
- `status` (optional): 'active', 'inactive', or 'all'

## Database Schema (Example)

```sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_code VARCHAR(50) NOT NULL UNIQUE,
    parent_department_id INT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id)
);
```

## Usage Examples

### Navigation

```typescript
import { Router } from '@angular/router';

// Navigate to department list
this.router.navigate(['/department/list']);

// Navigate to add form
this.router.navigate(['/department/add']);

// Navigate to edit form
this.router.navigate(['/department/edit', departmentId]);

// Navigate to form based on context
const route = isEdit ? `/department/edit/${id}` : '/department/add';
this.router.navigate([route]);
```

### Using Department Service

```typescript
import { DepartmentService } from '../../department/services/department.service';

// Get paginated departments
this.departmentService
  .getDepartments({
    page: 1,
    limit: 10,
    sortBy: 'department_name',
    sortOrder: 'asc',
  })
  .subscribe((response) => {
    this.departments = response.data;
    this.totalElements = response.total;
  });

// Create department
this.departmentService
  .createDepartment({
    department_name: 'Engineering',
    department_code: 'ENG',
    status: 'active',
  })
  .subscribe((result) => {
    if (result) {
      console.log('Created:', result);
    }
  });

// Update department
this.departmentService
  .updateDepartment(id, {
    department_name: 'Software Engineering',
    status: 'active',
  })
  .subscribe((result) => {
    if (result) {
      console.log('Updated:', result);
    }
  });

// Delete department
this.departmentService.deleteDepartment(id).subscribe((success) => {
  if (success) {
    console.log('Deleted successfully');
  }
});

// Build tree structure
this.departmentService.getAllDepartments().subscribe((departments) => {
  const tree = this.departmentService.buildDepartmentTree(departments);
  this.treeData = tree;
});
```

### Listening for Refresh Events

```typescript
import { DepartmentService } from '../../department/services/department.service';

constructor(private departmentService: DepartmentService) {}

// Subscribe to refresh events
this.departmentService.refresh$.subscribe(() => {
  this.loadDepartments();
  this.loadTree();
});

// Trigger refresh from elsewhere
this.departmentService.triggerRefresh();
```

## Customization

### Adding Custom Columns to Table

Edit `department-table.component.ts`:

```typescript
displayedColumns = [
  'department_name',
  'department_code',
  'parent_department_name',
  'status',
  'employee_count',  // Add custom column
  'actions'
];

// Add new column definition
<ng-container matColumnDef="employee_count">
  <th mat-header-cell *matHeaderCellDef>Employees</th>
  <td mat-cell *matCellDef="let dept">{{ dept.employee_count || 0 }}</td>
</ng-container>
```

### Adding New Form Fields

Edit `department-form.component.ts`:

```typescript
// Add to form group
this.departmentForm = this.fb.group({
  department_name: ['', Validators.required],
  department_code: ['', Validators.required],
  parent_department_id: [null],
  description: [''],
  status: ['active'],
  budget: [null], // Add new field
  manager_id: [null], // Add another field
});
```

### Styling Customization

Each component has scoped styles that can be customized:

```scss
// department-list.component.ts
styles: [`
  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #333;  // Change to match your theme
  }

  .card {
    border: none;
    border-radius: 10px;
    // Add custom styles
  }
`]
```

## Testing

### Unit Testing Example

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentListComponent } from './department-list.component';
import { DepartmentService } from '../../services/department.service';
import { of } from 'rxjs';

describe('DepartmentListComponent', () => {
  let component: DepartmentListComponent;
  let fixture: ComponentFixture<DepartmentListComponent>;
  let departmentService: jasmine.SpyObj<DepartmentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DepartmentService', [
      'getDepartments',
      'getAllDepartments',
      'deleteDepartment',
    ]);

    await TestBed.configureTestingModule({
      declarations: [DepartmentListComponent],
      providers: [{ provide: DepartmentService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentListComponent);
    component = fixture.componentInstance;
    departmentService = TestBed.get(DepartmentService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load departments on init', () => {
    const mockResponse = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    departmentService.getDepartments.and.returnValue(of(mockResponse));
    departmentService.getAllDepartments.and.returnValue(of([]));

    component.ngOnInit();

    expect(departmentService.getDepartments).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Common Issues

**1. Module not found errors**

- Ensure the module path is correct in routing
- Run `ng build` to check for compilation errors

**2. HTTP requests not working**

- Check CORS configuration on backend
- Verify API URLs in environment files
- Ensure HttpClientModule is imported

**3. Styling issues**

- Ensure Bootstrap CSS is loaded
- Check for CSS conflicts
- Verify FontAwesome icons are available

**4. Material Table issues**

- Ensure MatTableModule is imported
- Check that dataSource is properly initialized
- Verify paginator and sort are connected

**5. Modal/Toaster not appearing**

- Ensure SharedModule is imported
- Check that ModalComponent and ToasterComponent are in declarations
- Verify ModalService and ToasterService are provided

### Debug Mode

Enable detailed logging in services:

```typescript
// department-api.service.ts
getDepartments(params: DepartmentPaginationParams): Observable<...> {
  console.log('Fetching departments:', params);
  return this.http.get<...>(...).pipe(
    tap(response => console.log('Response:', response))
  );
}
```

## Performance Optimization

### Lazy Loading

The module is already lazy-loaded, reducing initial bundle size.

### Virtual Scrolling

For large datasets, consider adding virtual scrolling:

```typescript
// department-table.component.ts
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    ScrollingModule
  ]
})
```

### Memoization

Use memoization for expensive tree building operations:

```typescript
// department.service.ts
private treeCache = new Map<string, DepartmentNode[]>();

buildDepartmentTree(departments: Department[]): DepartmentNode[] {
  const cacheKey = JSON.stringify(departments.map(d => d.id));

  if (this.treeCache.has(cacheKey)) {
    return this.treeCache.get(cacheKey)!;
  }

  const tree = this.performTreeBuilding(departments);
  this.treeCache.set(cacheKey, tree);
  return tree;
}
```

## Security Considerations

- All routes are protected by AuthGuard
- Input validation on both client and server
- XSS prevention through Angular's built-in protections
- CSRF token handling (if applicable)

## Support

For issues or questions:

1. Check the module README
2. Review API documentation
3. Examine component templates
4. Test with mock data first

## Version History

- v1.0.0 - Initial release with basic CRUD operations
- Features: List, Add, Edit, Delete, Tree view, Search, Filter, Sort, Pagination

## License

Internal HRM System Module - All rights reserved
