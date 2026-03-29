# Department Module - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Shell                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   AppRoutingModule                      ││
│  │  ┌────────────────────────────────────────────────────┐ ││
│  │  │           DashboardLayoutComponent                 │ ││
│  │  │  ┌──────────────────────────────────────────────┐  │ ││
│  │  │  │           Department Module (Lazy)           │  │ ││
│  │  │  │  ┌────────────────────────────────────────┐   │  │ ││
│  │  │  │  │     DepartmentRoutingModule           │   │  │ ││
│  │  │  │  └────────────────────────────────────────┘   │  │ ││
│  │  │  │                                              │  │ ││
│  │  │  │  ┌─────────────────┐ ┌─────────────────┐   │  │ ││
│  │  │  │  │ DepartmentList  │ │ DepartmentForm  │   │  │ ││
│  │  │  │  │   Component     │ │   Component     │   │  │ ││
│  │  │  │  │    (Page)       │ │    (Page)       │   │  │ ││
│  │  │  │  └────────┬────────┘ └────────┬────────┘   │  │ ││
│  │  │  │           │                    │            │  │ ││
│  │  │  │  ┌────────┴────────────────────┴────────┐   │  │ ││
│  │  │  │  │         Components Layer              │   │  │ ││
│  │  │  │  │  ┌────────────────┐ ┌─────────────┐  │   │  │ ││
│  │  │  │  │  │DepartmentTable│ │DepartmentTree│  │   │  │ ││
│  │  │  │  │  │  Component    │ │  Component   │  │   │  │ ││
│  │  │  │  │  └────────────────┘ └─────────────┘  │   │  │ ││
│  │  │  │  └────────────────────────────────────────┘   │  │ ││
│  │  │  │                                              │  │ ││
│  │  │  └──────────────────────────────────────────────┘  │  ││
│  │  │                                                      ││
│  │  └────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

                        │
                        ▼

┌─────────────────────────────────────────────────────────────┐
│                     Services Layer                           │
│                                                              │
│  ┌──────────────────────┐    ┌───────────────────────────┐   │
│  │  DepartmentService   │◄───│ DepartmentApiService     │   │
│  │  (Business Logic)    │    │ (API Communication)      │   │
│  │                      │    │                           │   │
│  │  • CRUD operations   │    │  • HTTP requests         │   │
│  │  • Tree building     │    │  • Parameter handling    │   │
│  │  • Refresh triggers  │    │  • Error handling        │   │
│  │  • Cache management   │    │  • Response mapping      │   │
│  └──────────────────────┘    └───────────────────────────┘   │
│                                    │                          │
└────────────────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │   Backend API       │
                         │                     │
                         │ GET  /departments   │
                         │ POST /departments   │
                         │ PUT  /departments/:id│
                         │DELETE /departments/:id│
                         │ GET  /departments/all│
                         └─────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Shared Dependencies                      │
│                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  SharedModule   │  │CoreServices  │  │  CoreGuards    │  │
│  │                 │  │              │  │                │  │
│  │ • CommonModule  │  │• ToasterSvc  │  │ • AuthGuard    │  │
│  │ • FormsModule   │  │• ModalSvc    │  │                │  │
│  │ • RouterModule  │  │• AuthSvc    │  │                │  │
│  │ • MatTableModule│  │              │  │                │  │
│  │ • MatSortModule │  └──────────────┘  └────────────────┘  │
│  │ • MatPaginator  │                                           │
│  └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action
    │
    ▼
┌──────────────────────────────────────┐
│     Component (UI Event)             │
│     e.g., click "Edit" button       │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│     DepartmentService                │
│     • Business logic                │
│     • Data transformation            │
│     • Refresh notification           │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│     DepartmentApiService             │
│     • HTTP call                      │
│     • URL construction               │
│     • Parameter encoding             │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│     Backend API                      │
│     • Database operation             │
│     • Validation                     │
│     • Response                       │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│     Observable Stream                │
│     • RxJS operators                 │
│     • Error handling                 │
│     • Transformation                  │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│     Component (UI Update)            │
│     • Update data                    │
│     • Show notification              │
│     • Refresh list                   │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│     Toaster Service                  │
│     • Show success/error message    │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
DepartmentModule
│
├── DepartmentRoutingModule
│   └── Routes: /list, /add, /edit/:id
│
├── DepartmentListComponent (Page)
│   ├── Search Input
│   ├── Status Filter
│   ├── View Toggle (Table/Tree)
│   │
│   ├── DepartmentTableComponent
│   │   ├── Material Table
│   │   ├── Columns: Name, Code, Parent, Status, Actions
│   │   ├── Sorting
│   │   └── Pagination
│   │
│   └── DepartmentTreeComponent
│       ├── Recursive Tree Nodes
│       ├── Expand/Collapse
│       └── Visual Hierarchy
│
└── DepartmentFormComponent (Page)
    ├── Reactive Form
    │   ├── Department Name (required, unique)
    │   ├── Department Code (required, unique)
    │   ├── Parent Department (dropdown)
    │   ├── Description (optional)
    │   └── Status (toggle)
    │
    ├── Validation Messages
    ├── Async Validators
    └── Action Buttons (Submit, Cancel)
```

## Module Dependencies Graph

```
┌─────────────────┐
│  DepartmentModule │
└────────┬────────┘
         │
    ┌────┴──────────────────────┐
    │                           │
    ▼                           ▼
┌───────────────┐      ┌───────────────┐
│ SharedModule  │      │CoreServices   │
│               │      │               │
│ • CommonModule│      │• ToasterSvc   │
│ • FormsModule  │◄─────│• ModalSvc     │
│ • ReactiveForms│      │• AuthService  │
│ • RouterModule │      │               │
│ • MatTable     │      └───────────────┘
│ • MatSort      │
│ • MatPaginator │
└───────────────┘
         ▲
         │
┌────────┴────────┐
│   CoreGuards    │
│                 │
│ • AuthGuard     │
│ • RoleGuard     │
│ • GuestGuard    │
└─────────────────┘
```

## File Structure Tree

```
department/
│
├── department.module.ts                    # Main module
├── department-routing.module.ts           # Routing configuration
├── index.ts                               # Barrel export
│
├── models/
│   ├── department.model.ts               # Interfaces
│   └── index.ts
│
├── services/
│   ├── department.service.ts             # Business logic
│   ├── department-api.service.ts        # API calls
│   └── index.ts
│
├── components/
│   ├── department-table/
│   │   └── department-table.component.ts  # Reusable table
│   ├── department-tree/
│   │   └── department-tree.component.ts   # Tree view
│   └── index.ts
│
├── pages/
│   ├── department-list/
│   │   └── department-list.component.ts    # List page
│   ├── department-form/
│   │   └── department-form.component.ts    # Add/Edit page
│   └── index.ts
│
└── documentation/
    ├── README.md                          # Full documentation
    ├── INTEGRATION.md                     # Integration guide
    ├── QUICKSTART.md                      # Quick start
    └── ARCHITECTURE.md                    # This file
```

## State Management Flow

```
┌────────────────────────────────────────────┐
│              State Changes                 │
│                                            │
│  ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ Initial  │───►│ Loading  │───►│ Loaded ││
│  │  State   │    │  State   │    │ State  ││
│  └──────────┘    └──────────┘    └────────┘│
│       ▲              │               │     │
│       │              │               │     │
│       │              ▼               ▼     │
│       │         ┌──────────┐    ┌────────┐│
│       └─────────│  Error   │◄───►│ Update ││
│                 │  State   │    │ State  ││
│                 └──────────┘    └────────┘│
└────────────────────────────────────────────┘

State Properties:
─────────────────
• departments: Department[]
• departmentTree: DepartmentNode[]
• loading: boolean
• error: string | null
• searchTerm: string
• statusFilter: 'all' | 'active' | 'inactive'
• currentPage: number
• pageSize: number
• totalElements: number
• sortColumn: string
• sortOrder: 'asc' | 'desc'
• viewMode: 'table' | 'tree'
```

## API Request/Response Flow

```
List Request:
─────────────
GET /api/departments?page=1&limit=10&sortBy=name&search=test&status=active
        │
        ▼
Response:
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}

Create Request:
──────────────
POST /api/departments
{
  "department_name": "Engineering",
  "department_code": "ENG",
  "parent_department_id": 1,
  "description": "Engineering team",
  "status": "active"
}
        │
        ▼
Response:
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 5,
    "department_name": "Engineering",
    ...
  }
}

Update Request:
──────────────
PUT /api/departments/5
{
  "department_name": "Software Engineering",
  ...
}
        │
        ▼
Response:
{
  "success": true,
  "message": "Department updated successfully",
  "data": {...}
}
```

## Validation Flow

```
Form Input Change
       │
       ▼
┌─────────────────────────────────┐
│  Reactive Form Validation       │
│                                 │
│  1. Sync Validation            │
│     • Required                  │
│     • Pattern                   │
│     • MinLength/MaxLength       │
│                                 │
│  2. Async Validation (debounce) │
│     • Check name uniqueness     │
│     • Check code uniqueness     │
│                                 │
│  3. Business Rules             │
│     • Prevent self-reference    │
│     • Prevent circular ref    │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  UI Feedback                   │
│                                 │
│  • Show inline errors           │
│  • Disable submit if invalid   │
│  • Highlight invalid fields     │
│  • Display helper text         │
└─────────────────────────────────┘
```

## Component Communication

```
Parent (List)                    Child (Table)
─────────────                    ──────────────
@Input() departments             [departments]
@Input() pageSize                [pageSize]
@Input() totalElements           [totalElements]

@Output() edit ─────────────────► onEdit()
@Output() delete ───────────────► onDelete()
@Output() page ─────────────────► onPageChange()
@Output() sort ─────────────────► onSortChange()

Siblings Communication (via Parent):
─────────────────────────────────────
DepartmentTableComponent
        │
        │ (emit event)
        ▼
DepartmentListComponent
        │
        │ (update state)
        ▼
DepartmentTreeComponent
        │
        │ (receive new data via @Input())
        ▼
Refresh Tree View
```

## Performance Optimization Points

```
1. Lazy Loading
   └── Module loaded on demand

2. Change Detection
   └── Default strategy (CheckAlways)
       └── Can be optimized to OnPush

3. Search Debouncing
   └── 300ms debounce on search input

4. Virtual Scrolling
   └── For large lists (CDK Virtual Scroll)

5. Memoization
   └── Tree building cached by department IDs

6. OnPush Strategy
   └── Components can use OnPush

7. TrackBy Functions
   └── *ngFor with trackBy for performance

8. Lazy Loading Data
   └── Pagination reduces initial load

9. Service Caching
   └── Departments cached until refresh
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────┐
│           Error Handling Flow              │
│                                             │
│  1. Component Level                         │
│     ├── Form validation errors             │
│     ├── User input validation              │
│     └── UI feedback (inline messages)      │
│                                             │
│  2. Service Level                           │
│     ├── HTTP error catching                │
│     ├── Retry logic (optional)             │
│     └── Fallback values                   │
│                                             │
│  3. HTTP Interceptor Level                  │
│     ├── Global error handling             │
│     ├── Authentication errors             │
│     ├── Network error handling            │
│     └── Token refresh                     │
│                                             │
│  4. User Feedback                          │
│     ├── Toast notifications               │
│     ├── Error modals                      │
│     └── Loading indicators                │
└─────────────────────────────────────────────┘
```

## Security Considerations

```
1. Route Protection
   └── AuthGuard on all routes

2. Input Sanitization
   └── Angular automatic HTML encoding

3. XSS Prevention
   └── No dangerouslySetInnerHTML usage

4. CSRF Protection
   └── Backend handles CSRF tokens

5. API Security
   └── Auth token in HTTP headers

6. Validation
   └── Client-side validation (UX)
   └── Server-side validation (Security)

7. Authorization
   └── Role-based access (future)
```

This architecture provides a scalable, maintainable, and performant solution for department management in an HRM system.
