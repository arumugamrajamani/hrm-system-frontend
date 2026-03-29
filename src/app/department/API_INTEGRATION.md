# Department Module - Real API Integration ✅

## API Connection Established

The Department module has been successfully integrated with the real backend API at `http://localhost:3000/api/departments`.

## Backend API Endpoints

The backend provides the following RESTful API endpoints:

### 1. **GET /api/departments**

Get all departments with pagination, search, and filtering.

**Query Parameters:**

```typescript
{
  page: number,        // Page number (default: 1)
  limit: number,       // Items per page (default: 10, max: 100)
  search?: string,     // Search by name, code, or description
  status?: string,     // Filter by 'active' or 'inactive'
  sortBy?: string,     // Field to sort by
  sortOrder?: string   // 'asc' or 'desc'
}
```

**Response:**

```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "id": 1,
      "department_name": "Engineering",
      "department_code": "ENG",
      "parent_department_id": null,
      "description": "Engineering team",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-02-20T14:45:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 2. **GET /api/departments/:id**

Get a specific department by ID with parent information.

**Response:**

```json
{
  "success": true,
  "message": "Department retrieved successfully",
  "data": {
    "id": 1,
    "department_name": "Engineering",
    "department_code": "ENG",
    "parent_department_id": null,
    "parent_department_name": null,
    "description": "Engineering team",
    "status": "active"
  }
}
```

### 3. **POST /api/departments**

Create a new department (Admin only).

**Request Body:**

```json
{
  "department_name": "Frontend Team",
  "department_code": "FE",
  "parent_department_id": 1,
  "description": "Frontend development team",
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 5,
    "department_name": "Frontend Team",
    "department_code": "FE",
    "parent_department_id": 1,
    "description": "Frontend development team",
    "status": "active"
  }
}
```

**Validation Errors:**

```json
{
  "success": false,
  "message": "Department name already exists",
  "errors": {
    "department_name": "Department name already exists"
  }
}
```

### 4. **PUT /api/departments/:id**

Update an existing department (Admin only).

**Request Body:**

```json
{
  "department_name": "Software Engineering",
  "department_code": "SE",
  "status": "inactive"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "id": 1,
    "department_name": "Software Engineering",
    "department_code": "SE",
    "status": "inactive"
  }
}
```

### 5. **DELETE /api/departments/:id**

Soft delete (deactivate) a department (Admin only).

**Constraints:**

- Cannot delete departments with child departments
- Only soft delete (marks as inactive)

**Response:**

```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Cannot delete department with child departments"
}
```

### 6. **GET /api/departments/hierarchy**

Get department hierarchy as a nested tree structure.

**Response:**

```json
{
  "success": true,
  "message": "Department hierarchy retrieved successfully",
  "data": [
    {
      "id": 1,
      "department_name": "Engineering",
      "department_code": "ENG",
      "parent_department_id": null,
      "description": "Engineering team",
      "status": "active",
      "children": [
        {
          "id": 3,
          "department_name": "Frontend Team",
          "department_code": "FE",
          "parent_department_id": 1,
          "children": []
        },
        {
          "id": 4,
          "department_name": "Backend Team",
          "department_code": "BE",
          "parent_department_id": 1,
          "children": []
        }
      ]
    },
    {
      "id": 2,
      "department_name": "Human Resources",
      "department_code": "HR",
      "parent_department_id": null,
      "children": []
    }
  ]
}
```

### 7. **PATCH /api/departments/:id/activate**

Activate a deactivated department (Admin only).

**Response:**

```json
{
  "success": true,
  "message": "Department activated successfully",
  "data": {
    "id": 1,
    "status": "active"
  }
}
```

### 8. **PATCH /api/departments/:id/deactivate**

Deactivate an active department (Admin only).

**Constraints:**

- Cannot deactivate departments with child departments

**Response:**

```json
{
  "success": true,
  "message": "Department deactivated successfully",
  "data": {
    "id": 1,
    "status": "inactive"
  }
}
```

## Backend Validations

The backend enforces the following validations:

### Department Name

- ✅ Required field
- ✅ Must be between 2-100 characters
- ✅ Must be unique across all departments
- ✅ Case-insensitive comparison

### Department Code

- ✅ Required field
- ✅ Must be between 2-20 characters
- ✅ Must contain only alphanumeric characters, hyphens, and underscores
- ✅ Must be unique across all departments
- ✅ Must start with a letter

### Parent Department

- ✅ Optional field (can be null)
- ✅ Must reference an existing department
- ✅ Cannot create circular hierarchy (department cannot be its own ancestor)
- ✅ When updating, cannot set self as parent

### Description

- ✅ Optional field
- ✅ Maximum 1000 characters

### Status

- ✅ Required field
- ✅ Must be either 'active' or 'inactive'
- ✅ Defaults to 'active' on creation

## API Service Methods

The `DepartmentApiService` provides the following methods:

```typescript
// Get paginated list with search and filters
getDepartments(params: DepartmentPaginationParams): Observable<PaginatedResponse<Department>>

// Get department hierarchy as nested tree
getDepartmentHierarchy(): Observable<ApiResponse<DepartmentHierarchyResponse[]>>

// Get single department by ID
getDepartment(id: number): Observable<ApiResponse<Department>>

// Get child departments
getChildDepartments(id: number): Observable<ApiResponse<Department[]>>

// Create new department
createDepartment(department: Partial<Department>): Observable<ApiResponse<Department>>

// Update existing department
updateDepartment(id: number, department: Partial<Department>): Observable<ApiResponse<Department>>

// Soft delete (deactivate) department
deleteDepartment(id: number): Observable<ApiResponse>

// Activate department
activateDepartment(id: number): Observable<ApiResponse<Department>>

// Deactivate department
deactivateDepartment(id: number): Observable<ApiResponse<Department>>
```

## Business Logic Service

The `DepartmentService` provides a higher-level API with:

### Caching

- ✅ Intelligent caching with 5-minute TTL
- ✅ Cache invalidation on mutations
- ✅ Cached tree structure for hierarchy view

### Error Handling

- ✅ Graceful error handling with fallback values
- ✅ Console logging for debugging
- ✅ Observable error propagation

### Data Transformation

- ✅ Converts backend hierarchy to tree structure
- ✅ Handles null/undefined parent IDs
- ✅ Type-safe responses

## Form Validation Strategy

### Client-Side Validation

- ✅ Required field validation
- ✅ Length validation (min/max)
- ✅ Pattern validation (code format)
- ✅ Real-time feedback

### Server-Side Validation

- ✅ Duplicate name/code checking
- ✅ Circular hierarchy prevention
- ✅ Business rule validation
- ✅ Server error display

### Error Handling

```typescript
error: (error) => {
  if (error.error?.message) {
    const errorMessage = error.error.message;

    if (errorMessage.includes('name')) {
      form.get('department_name')?.setErrors({ serverError: errorMessage });
    } else if (errorMessage.includes('code')) {
      form.get('department_code')?.setErrors({ serverError: errorMessage });
    }

    this.toasterService.error('Validation Error', errorMessage);
  }
};
```

## Authentication & Authorization

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer <access_token>
```

### Admin-Only Operations

The following operations require admin privileges:

- ✅ Create department
- ✅ Update department
- ✅ Delete department
- ✅ Activate department
- ✅ Deactivate department

If a non-admin user tries to perform these operations, they'll receive:

```json
{
  "success": false,
  "message": "Forbidden - Admin access required"
}
```

## Rate Limiting

The API implements rate limiting via `generalLimiter`:

- Prevents abuse and DoS attacks
- Returns 429 Too Many Requests if exceeded

## Pagination

The API uses cursor-based pagination with the following structure:

```typescript
{
  data: Department[],
  pagination: {
    total: number,        // Total number of items
    page: number,        // Current page
    limit: number,       // Items per page
    totalPages: number   // Total number of pages
  }
}
```

### Frontend Pagination

The frontend automatically:

- ✅ Handles pagination state
- ✅ Updates page size
- ✅ Refreshes data on page change
- ✅ Caches paginated results

## Search & Filtering

### Search

Searches across:

- Department name
- Department code
- Description

**Example:**

```
GET /api/departments?search=engineering
```

### Status Filter

Filter by active/inactive status:

**Example:**

```
GET /api/departments?status=active
GET /api/departments?status=inactive
```

### Combined Filters

Filters can be combined:

**Example:**

```
GET /api/departments?search=engineering&status=active&page=1&limit=20
```

## Tree View Integration

The frontend uses the `/hierarchy` endpoint to build the tree view:

### Backend Hierarchy Endpoint

Returns pre-built tree structure:

```json
{
  "data": [
    {
      "id": 1,
      "department_name": "Engineering",
      "children": [...]
    }
  ]
}
```

### Frontend Transformation

The service converts this to `DepartmentNode[]`:

```typescript
interface DepartmentNode {
  id: number;
  department_name: string;
  department_code: string;
  parent_department_id?: number;
  description?: string;
  status: 'active' | 'inactive';
  children?: DepartmentNode[];
  expanded?: boolean;
  level?: number;
}
```

## Performance Optimizations

### 1. **Caching**

- ✅ Paginated results cached
- ✅ Hierarchy cached for 5 minutes
- ✅ Cache invalidated on mutations

### 2. **Lazy Loading**

- ✅ Tree data loaded only when tree view selected
- ✅ Reduces initial page load

### 3. **Optimistic Updates**

- ✅ Cache cleared immediately on mutations
- ✅ UI reflects changes quickly

### 4. **Debounced Search**

- ✅ 300ms debounce prevents API spam
- ✅ Better server performance

## Error Codes

Common HTTP status codes:

- **200**: Success
- **201**: Created successfully
- **400**: Validation error
- **401**: Unauthorized (missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **409**: Conflict (duplicate entry)
- **429**: Too many requests (rate limited)
- **500**: Internal server error

## Testing the API

### With Authentication Token

```bash
curl -X GET http://localhost:3000/api/departments \
  -H "Authorization: Bearer <your_token>"
```

### Create Department

```bash
curl -X POST http://localhost:3000/api/departments \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "department_name": "New Department",
    "department_code": "ND",
    "status": "active"
  }'
```

### Get Hierarchy

```bash
curl -X GET http://localhost:3000/api/departments/hierarchy \
  -H "Authorization: Bearer <your_token>"
```

## Swagger Documentation

Full API documentation available at:

```
http://localhost:3000/api-docs/
```

Interactive documentation with:

- Request/response examples
- Schema definitions
- Try-it-out functionality
- Authentication setup

## Common Issues & Solutions

### Issue 1: "Access token is required"

**Solution:** Include Bearer token in Authorization header

### Issue 2: "Admin access required"

**Solution:** Ensure user has admin role

### Issue 3: "Department name already exists"

**Solution:** Choose a unique department name

### Issue 4: "Cannot delete department with child departments"

**Solution:** Delete or reassign child departments first

### Issue 5: "Circular hierarchy detected"

**Solution:** Cannot set a department as its own ancestor or descendant as parent

## Environment Configuration

### Development

```typescript
environment = {
  production: false,
  departmentsApiUrl: 'http://localhost:3000/api/departments',
};
```

### Production

```typescript
environment = {
  production: true,
  departmentsApiUrl: 'https://api.yourdomain.com/api/departments',
};
```

## Summary

✅ **Real API Integration Complete**

- All CRUD operations connected
- Hierarchy endpoint used for tree view
- Server-side validation handled
- Authentication required
- Admin permissions enforced

✅ **Optimizations Applied**

- Intelligent caching
- Lazy loading
- Error handling
- Performance monitoring

✅ **Ready for Production**

- Scalable architecture
- Secure API calls
- Comprehensive error handling
- Full TypeScript support

The Department module is now fully integrated with the real backend API and ready for production use! 🚀
