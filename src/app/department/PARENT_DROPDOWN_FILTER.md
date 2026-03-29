# Parent Department Dropdown - Filter Guide

## Current Implementation

The Parent Department dropdown is designed to show **only departments without a parent** (root departments). This prevents complex multi-level hierarchies and keeps the organizational structure simple.

## How It Works

### 1. **Root Department Definition**

A root department is one where:

- `parent_department_id` is `null`
- `parent_department_id` is `undefined`
- `parent_department_id` is `0`

### 2. **Backend Data Structure**

When the API returns departments, it includes:

```json
{
  "id": 1,
  "department_name": "Engineering",
  "department_code": "ENG",
  "parent_department_id": null, // Root department
  "status": "active"
}
```

### 3. **Frontend Filtering**

In `DepartmentFormComponent`, the `loadRootDepartments()` method filters the API response:

```typescript
loadRootDepartments(): void {
  this.departmentService.getAllDepartments().subscribe((departments) => {
    // Filter to only show departments without a parent
    const rootDepts = departments.filter((dept) => {
      return dept.parent_department_id === null ||
             dept.parent_department_id === undefined ||
             dept.parent_department_id === 0;
    });
    this.rootDepartments.set(rootDepts);
    this.cdr.markForCheck();
  });
}
```

### 4. **Template Rendering**

The dropdown template uses the filtered `rootDepartments` signal:

```html
<select class="form-select" formControlName="parent_department_id">
  <option [ngValue]="null">No Parent (Root Department)</option>

  @for (dept of rootDepartments(); track dept.id) {
  <option [ngValue]="dept.id">{{ dept.department_name }} ({{ dept.department_code }})</option>
  }
</select>
```

## Example

### Backend Data

```
1. Engineering (parent_id: null) ✓ Root - Shows in dropdown
   ├── Frontend Team (parent_id: 1) ✗ Child - Hidden
   └── Backend Team (parent_id: 1) ✗ Child - Hidden

2. Human Resources (parent_id: null) ✓ Root - Shows in dropdown

3. Finance (parent_id: null) ✓ Root - Shows in dropdown

4. Sales (parent_id: 2) ✗ Child of HR - Hidden
```

### Dropdown Options

```
[No Parent (Root Department)]
Engineering (ENG)
Human Resources (HR)
Finance (FIN)
```

**Note**: Frontend Team, Backend Team, and Sales are NOT shown because they have a parent department.

## Why Only Root Departments?

### Benefits

1. **Simplicity**: Prevents deep nesting (max 1 level of hierarchy)
2. **Clarity**: Easy to understand organizational structure
3. **Data Integrity**: Avoids circular references
4. **UX**: Fewer options = easier selection

### Alternative Approach

If you need multi-level hierarchy, you would need to:

1. Fetch all departments with `parent_department_id`
2. Build a recursive tree structure
3. Use a tree selector component instead of dropdown

## Testing the Filter

### Test 1: Verify API Response

```typescript
// In browser console or service
this.departmentService.getAllDepartments().subscribe((depts) => {
  console.log('All departments:', depts);
  console.log(
    'Root departments:',
    depts.filter((d) => !d.parent_department_id),
  );
});
```

### Test 2: Verify Dropdown Options

1. Open browser DevTools
2. Go to Network tab
3. Navigate to Add Department
4. Check the dropdown in the form
5. Should only see root departments

### Test 3: Check Edit Mode

1. Edit a root department (e.g., Engineering)
2. Dropdown should show other root departments
3. Current department should be excluded
4. Child departments should not appear

## Expected Behavior

### Add Department Page

- ✅ Shows only root departments in dropdown
- ✅ "No Parent (Root Department)" option available
- ✅ Empty if no root departments exist

### Edit Department Page

- ✅ Shows only root departments in dropdown
- ✅ Current department excluded from list
- ✅ Selected parent pre-selected in dropdown

## Common Issues

### Issue 1: Dropdown Shows All Departments

**Cause**: Filter not working correctly

**Solution**: Check if `parent_department_id` is properly set in API response

```typescript
// Add debug logging
const rootDepts = departments.filter((dept) => {
  console.log('Dept:', dept.department_name, 'parent_id:', dept.parent_department_id);
  return dept.parent_department_id === null || dept.parent_department_id === undefined;
});
```

### Issue 2: Empty Dropdown

**Cause**: No root departments exist

**Solution**: Create at least one root department first

### Issue 3: Wrong Departments Showing

**Cause**: API returning wrong `parent_department_id` values

**Solution**: Check backend database or API response

## Backend Requirements

The backend API should return `parent_department_id` as:

- `null` for root departments
- Integer ID for child departments
- Never return `-1` or other invalid values

## Related Code Files

1. **Form Component**: `department-form.component.ts`
   - Method: `loadRootDepartments()`
   - Signal: `rootDepartments`

2. **Service Layer**: `department.service.ts`
   - Method: `getAllDepartments()`
   - Caching: `allDepartmentsCache`

3. **API Service**: `department-api.service.ts`
   - Endpoint: `GET /api/departments`

4. **Backend**: `departmentRoutes.js`
   - Endpoint: `/api/departments`

## Summary

✅ **Current Status**: Filtered to show only root departments
✅ **Filter Logic**: Checks for null/undefined/0 `parent_department_id`
✅ **Dropdown Options**: Root departments + "No Parent" option
✅ **Edit Mode**: Excludes current department from list
✅ **Performance**: Cached in service layer

The implementation correctly filters and displays only departments that don't have a parent, making the hierarchy simple and manageable!
