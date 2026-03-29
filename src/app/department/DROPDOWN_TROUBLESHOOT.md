# Parent Department Dropdown - Troubleshooting

## Quick Test

### Step 1: Open Browser Console

Press `F12` or `Ctrl+Shift+I` to open DevTools

### Step 2: Navigate to Add Department

Go to: `/department/add`

### Step 3: Check Console for Logs

You should see:

```
Root departments loaded: [...]
```

### Step 4: Check Network Tab

Filter for: `departments`

- Should see call to `/api/departments/hierarchy`
- Should see response with data array

## Common Issues & Solutions

### Issue 1: Console shows "Root departments loaded: []"

**Cause**: Empty array returned

**Solution**:

1. Check Network tab for API response
2. Ensure departments exist in database
3. Ensure at least one department has `parent_department_id: null`

### Issue 2: Console shows "Error loading root departments"

**Cause**: API call failed

**Solution**:

1. Check Network tab for error
2. Ensure backend is running on port 3000
3. Ensure you're authenticated (check token)

### Issue 3: Dropdown shows "No root departments available"

**Cause**: No root departments in database

**Solution**:

1. Create at least one department without a parent
2. Or manually set `parent_department_id: null` in database

### Issue 4: All departments showing (not just root)

**Cause**: API returning wrong data

**Solution**:

1. Check if using correct endpoint
2. Verify backend `/api/departments/hierarchy` returns only roots
3. Check console logs for debugging

## Debugging Steps

### 1. Check API Response

```javascript
// In browser console, fetch directly:
fetch('http://localhost:3000/api/departments/hierarchy', {
  headers: {
    Authorization: 'Bearer <your_token>',
  },
})
  .then((res) => res.json())
  .then((data) => console.log('Hierarchy:', data));
```

### 2. Check Service Call

Add this to form component:

```typescript
console.log('Calling getRootDepartmentsForDropdown...');
this.departmentService.getRootDepartmentsForDropdown().subscribe({
  next: (data) => console.log('Received:', data),
  error: (err) => console.error('Error:', err),
});
```

### 3. Check Template Binding

```html
<!-- Add this to see what's in the signal -->
<p>Root departments count: {{ rootDepartments().length }}</p>

<!-- Check if signal is updating -->
@if (rootDepartments().length > 0) {
<p>Options available: YES</p>
} @else {
<p>Options available: NO</p>
}
```

## Expected Data Flow

```
1. Form Component Init
   ↓
2. loadRootDepartments() called
   ↓
3. Service calls /api/departments/hierarchy
   ↓
4. Backend returns hierarchy with only root departments
   ↓
5. Service maps to Department array
   ↓
6. Form updates rootDepartments signal
   ↓
7. Template re-renders dropdown
```

## Backend Requirements

### API Endpoint

`GET /api/departments/hierarchy`

### Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "department_name": "Engineering",
      "department_code": "ENG",
      "parent_department_id": null,
      "children": [...]
    },
    {
      "id": 2,
      "department_name": "HR",
      "department_code": "HR",
      "parent_department_id": null,
      "children": [...]
    }
  ]
}
```

**Note**: Only root departments (parent_department_id: null) should be at the top level of the hierarchy response.

## Manual Verification

### Check Database

```sql
SELECT * FROM departments WHERE parent_department_id IS NULL;
```

Should return at least one department.

### Check API Directly

```bash
curl -X GET http://localhost:3000/api/departments/hierarchy \
  -H "Authorization: Bearer <token>"
```

Should return array of root departments.

## Quick Fixes

### If dropdown is empty:

1. Create a root department via API or database
2. Ensure `parent_department_id` is `NULL`

### If showing all departments:

1. Backend hierarchy endpoint not filtering correctly
2. Check backend controller logic
3. Or fallback to using `/api/departments` and filter client-side

### If API errors:

1. Check if backend is running
2. Check authentication token
3. Check CORS settings

## Console Commands

Paste in browser console to test:

```javascript
// Test 1: Check if departments exist
fetch('/api/departments?limit=100', {
  headers: { Authorization: 'Bearer ' + localStorage.getItem('hrm_token') },
})
  .then((r) => r.json())
  .then((d) => {
    console.log('Total departments:', d.data.length);
    console.log('Root depts:', d.data.filter((x) => !x.parent_department_id).length);
    console.log('Sample:', d.data.slice(0, 3));
  });

// Test 2: Check hierarchy
fetch('/api/departments/hierarchy', {
  headers: { Authorization: 'Bearer ' + localStorage.getItem('hrm_token') },
})
  .then((r) => r.json())
  .then((d) => {
    console.log('Hierarchy roots:', d.data.length);
    console.log('Roots:', d.data);
  });
```

## Success Indicators

✅ Console shows "Root departments loaded: [...]"
✅ Array has length > 0
✅ Network tab shows 200 response
✅ Dropdown has options
✅ No console errors

## Still Not Working?

1. Check if backend is running
2. Check authentication
3. Check database has data
4. Check Network tab for errors
5. Try refreshing the page
6. Try clearing browser cache
7. Try in incognito mode

## Summary

The dropdown should show only departments where `parent_department_id` is `null`. If it's not working:

1. Check API response first
2. Verify backend returns correct data
3. Check console logs for errors
4. Ensure data exists in database

The most common issue is backend not returning hierarchy correctly. Verify the `/api/departments/hierarchy` endpoint works!
