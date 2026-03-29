# Backend Error Handling - Complete Guide

## Overview

The Department form now properly displays backend error messages in both:

1. **Toast notifications** - For immediate visibility
2. **Inline field errors** - For field-specific validation
3. **Global error alerts** - For general errors

## Error Sources

### 1. Backend Validation Errors

The backend API returns errors in various formats:

#### Format 1: Direct Message

```json
{
  "success": false,
  "message": "Department name already exists"
}
```

#### Format 2: Validation Errors Object

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "department_name": "Department name already exists"
  }
}
```

#### Format 3: Array of Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Department name already exists", "Department code must be unique"]
}
```

#### Format 4: Multiple Field Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "department_name": "Name is required",
    "department_code": "Code must be unique"
  }
}
```

## Error Handling Flow

```
User Submits Form
        ↓
Backend Validates
        ↓
Error Occurs?
        ↓
    Yes        No
      ↓         ↓
Extract Error    Save Success
      ↓
Parse Error Format
      ↓
Set Field Errors (if applicable)
      ↓
Set Global Error
      ↓
Show Toast Notification
      ↓
Display in Form
```

## Error Display Locations

### 1. Toast Notification

Every backend error shows as a toast notification:

```
❌ Error
Department name already exists
```

**Duration**: 6 seconds (default)
**Type**: Error toast (red)

### 2. Inline Field Errors

Specific field errors display below the input:

```
❌ Department name already exists
```

### 3. Global Error Alert

Non-field-specific errors display at top of form:

```
⚠️ Error: Department name already exists    [X]
```

## Error Types & Examples

### Duplicate Name Error

```json
{
  "message": "Department name already exists"
}
```

**Display**:

- Toast: ❌ Error - Department name already exists
- Field: Red border on name field
- Message: "Department name already exists"

### Duplicate Code Error

```json
{
  "message": "Department code already exists"
}
```

**Display**:

- Toast: ❌ Error - Department code already exists
- Field: Red border on code field
- Message: "Department code already exists"

### Circular Hierarchy Error

```json
{
  "message": "Cannot create circular hierarchy"
}
```

**Display**:

- Toast: ❌ Error - Cannot create circular hierarchy
- Field: Red border on parent department field

### Validation Errors Object

```json
{
  "errors": {
    "department_name": "Name is required"
  }
}
```

**Display**:

- Toast: ❌ Error - Name is required
- Field: Red border on name field

### Multiple Errors

```json
{
  "errors": {
    "department_name": "Name is required",
    "department_code": "Code must be at least 2 characters"
  }
}
```

**Display**:

- Toast: ❌ Error - Name is required (shows first error)
- Field 1: "Name is required" below name field
- Field 2: "Code must be at least 2 characters" below code field

### Admin Permission Error

```json
{
  "message": "Forbidden - Admin access required"
}
```

**Display**:

- Toast: ❌ Error - Forbidden - Admin access required
- Global alert at top of form

### Network Error

```json
{
  "message": "Network error"
}
```

**Display**:

- Toast: ❌ Error - Network error
- Global alert: "An unexpected error occurred"

## Implementation Details

### Error Handler Method

```typescript
private handleError(error: any, form: FormGroup): void {
  // 1. Clear previous errors
  this.clearFieldErrors(form);

  // 2. Extract error message
  const errorMessage = this.extractErrorMessage(error);

  // 3. Set field-specific errors
  this.setFieldErrors(error.errors, form);

  // 4. Set global error
  this.globalError.set(errorMessage);

  // 5. Show toast
  this.toasterService.error('Error', errorMessage);
}
```

### Error Extraction Logic

```typescript
private extractErrorMessage(error: any): string {
  // Priority order:
  // 1. error.error.message (direct message)
  // 2. error.error.errors (first field error)
  // 3. error.message (generic message)
  // 4. error (string)
  // 5. Default message
}
```

### Field Error Mapping

Automatically maps backend field names to form fields:

| Backend Field          | Form Field             |
| ---------------------- | ---------------------- |
| `department_name`      | `department_name`      |
| `name`                 | `department_name`      |
| `department_code`      | `department_code`      |
| `code`                 | `department_code`      |
| `parent_department_id` | `parent_department_id` |
| `description`          | `description`          |

## Common Backend Errors

### 1. Duplicate Entry

```json
{
  "message": "Department name already exists"
}
```

**Solution**: Choose a different department name

### 2. Validation Failed

```json
{
  "success": false,
  "errors": {
    "department_name": "Name is required"
  }
}
```

**Solution**: Fill in the required field

### 3. Circular Hierarchy

```json
{
  "message": "Cannot create circular hierarchy"
}
```

**Solution**: Choose a different parent department

### 4. Admin Required

```json
{
  "message": "Forbidden - Admin access required"
}
```

**Solution**: Login as admin user

### 5. Department Not Found

```json
{
  "message": "Department not found"
}
```

**Solution**: Select a valid department

### 6. Cannot Delete with Children

```json
{
  "message": "Cannot delete department with child departments"
}
```

**Solution**: Delete or reassign child departments first

## Testing Error Handling

### Test 1: Duplicate Name

1. Create a department "Engineering"
2. Try to create another "Engineering"
3. **Expected**: Toast error + field error

### Test 2: Required Fields

1. Submit form without name
2. **Expected**: Toast error + field error

### Test 3: Network Error

1. Disconnect network
2. Submit form
3. **Expected**: Toast error with network message

### Test 4: Permission Error

1. Login as non-admin
2. Try to create department
3. **Expected**: Toast error about permissions

## Debugging Tips

### Check Console Logs

```javascript
// Error response in console
console.log('Error:', error);
console.log('Error message:', error.error?.message);
console.log('Error errors:', error.error?.errors);
```

### Network Tab

1. Open DevTools → Network
2. Submit form with error
3. Find the POST/PUT request
4. Check Response tab for error format

### Backend Logs

Check backend console for:

- Validation errors
- Database errors
- Authentication errors

## Error Message Best Practices

### Backend Should Return

✅ Clear, user-friendly messages
✅ Specific field errors
✅ Single responsibility errors
❌ Technical jargon
❌ Stack traces
❌ Internal error codes

### Examples

**Good Error Messages:**

- "Department name already exists"
- "Department code must be unique"
- "Name is required"
- "Cannot create circular hierarchy"

**Bad Error Messages:**

- "Duplicate entry key (department_name)"
- "ERROR 1062: Duplicate entry"
- "Validation failed for field department_name with constraint UNIQUE"
- "Stack trace: at DepartmentService.create..."

## Toast Notification Behavior

### Auto-Dismiss

- Duration: 6 seconds
- Auto-hides after timeout
- Manual dismiss available

### Types

- **Success** (green): "Department created successfully"
- **Error** (red): Backend error messages
- **Warning** (orange): "Please check form errors"
- **Info** (blue): Informational messages

### Stacking

Multiple toasts stack vertically:

```
┌─────────────────────────────┐
│ ❌ Error                    │
│ Department name exists      │
└─────────────────────────────┘
┌─────────────────────────────┐
│ ❌ Error                    │
│ Code is required           │
└─────────────────────────────┘
```

## Field Error Display

### Error Styling

```css
.is-invalid {
  border-color: #dc3545;
  background-color: #fff;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
}
```

### Visual Feedback

1. **Red border** on input field
2. **Error icon** (optional)
3. **Error message** below field
4. **Focus** stays on field

## Global Error Alert

### When Shown

- Non-field-specific errors
- Multiple field errors (first shown)
- Network errors
- Permission errors

### Dismissible

- Click X button to close
- Auto-clears on next submission
- Shows at top of form

### Styling

```css
.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c2c5;
  color: #842029;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
```

## Success Flow

When submission succeeds:

```
User Submits
        ↓
Backend Validates
        ↓
Success Response
        ↓
Clear All Errors
        ↓
Show Success Toast
        ↓
Navigate to List
        ↓
Refresh List Data
```

## Error Clearing

### On Form Load

- No errors initially
- Fields are empty/default

### On Field Change

- Clears field-specific error when user starts typing

### On Submit Attempt

- Validates all fields
- Shows all current errors
- Doesn't clear previous errors

### On Successful Submit

- Clears all errors
- Resets form

### On Navigation Away

- Form resets
- Errors cleared

## Summary

✅ **Toast notifications** for all errors
✅ **Field-specific errors** with red borders
✅ **Global error alerts** for non-field errors
✅ **Exact backend messages** displayed
✅ **Error parsing** for multiple formats
✅ **Automatic field mapping** from backend
✅ **Dismissible alerts**
✅ **Clear error clearing** logic

All backend error messages are now properly displayed to users with clear, actionable feedback! 🎯
