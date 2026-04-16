export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  fields?: string[];
  dateFormat?: string;
}

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
  width?: number;
}

export interface BulkActionConfig {
  id: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  confirm?: {
    title: string;
    message: string;
  };
}

export interface BulkSelectionState<T = any> {
  selectedItems: T[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  count: number;
}

export function createBulkSelectionState<T>(): BulkSelectionState<T> {
  return {
    selectedItems: [],
    isAllSelected: false,
    isIndeterminate: false,
    count: 0,
  };
}

export function toggleSelection<T>(
  state: BulkSelectionState<T>,
  item: T,
  getId: (t: T) => number | string,
): BulkSelectionState<T> {
  const id = getId(item);
  const index = state.selectedItems.findIndex((i) => getId(i) === id);

  let selectedItems: T[];
  if (index === -1) {
    selectedItems = [...state.selectedItems, item];
  } else {
    selectedItems = state.selectedItems.filter((_, i) => i !== index);
  }

  return {
    selectedItems,
    isAllSelected: false,
    isIndeterminate: selectedItems.length > 0,
    count: selectedItems.length,
  };
}

export function selectAll<T>(
  items: T[],
  selectedItems: T[],
  getId: (t: T) => number | string,
): BulkSelectionState<T> {
  const allIds = new Set(items.map(getId));
  const selectedIds = new Set(selectedItems.map(getId));
  const isAllSelected = items.length > 0 && selectedIds.size === allIds.size;

  return {
    selectedItems,
    isAllSelected,
    isIndeterminate: selectedItems.length > 0 && !isAllSelected,
    count: selectedItems.length,
  };
}
