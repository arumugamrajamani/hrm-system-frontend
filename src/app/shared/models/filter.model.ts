export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'between';

export interface FilterField {
  key: string;
  label?: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'range';
  operators?: FilterOperator[];
  options?: { label: string; value: any }[];
  placeholder?: string;
  defaultValue?: any;
}

export interface ActiveFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface FilterState {
  [key: string]: any;
}

export interface FilterParams {
  filters?: FilterState;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface SavedFilter {
  id?: number;
  name: string;
  filters: FilterParams;
  isDefault?: boolean;
}

export function buildQueryParams(params: FilterParams): Record<string, string> {
  const queryParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        queryParams[key] = JSON.stringify(value);
      } else {
        queryParams[key] = String(value);
      }
    }
  });

  return queryParams;
}
