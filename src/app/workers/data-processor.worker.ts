addEventListener('message', ({ data }) => {
  const { type, payload, id } = data;

  switch (type) {
    case 'FILTER':
      const filtered = filterData(payload.data, payload.filters);
      postMessage({ id, type: 'FILTER_RESULT', payload: filtered });
      break;

    case 'SORT':
      const sorted = sortData(payload.data, payload.sortBy, payload.sortOrder);
      postMessage({ id, type: 'SORT_RESULT', payload: sorted });
      break;

    case 'PAGINATE':
      const paginated = paginateData(payload.data, payload.page, payload.limit);
      postMessage({ id, type: 'PAGINATE_RESULT', payload: paginated });
      break;

    case 'SEARCH':
      const searched = searchData(payload.data, payload.query, payload.fields);
      postMessage({ id, type: 'SEARCH_RESULT', payload: searched });
      break;

    case 'AGGREGATE':
      const aggregated = aggregateData(payload.data, payload.field, payload.operation);
      postMessage({ id, type: 'AGGREGATE_RESULT', payload: aggregated });
      break;

    case 'GROUP_BY':
      const grouped = groupByField(payload.data, payload.field);
      postMessage({ id, type: 'GROUP_BY_RESULT', payload: grouped });
      break;

    case 'EXPORT_CSV':
      const csv = exportToCsv(payload.data, payload.columns);
      postMessage({ id, type: 'EXPORT_CSV_RESULT', payload: csv });
      break;

    case 'EXPORT_EXCEL':
      const excelData = prepareExcelData(payload.data);
      postMessage({ id, type: 'EXPORT_EXCEL_RESULT', payload: excelData });
      break;

    case 'PROCESS_LARGE_DATASET':
      const processed = processLargeDataset(payload.data, payload.operations);
      postMessage({ id, type: 'PROCESS_LARGE_DATASET_RESULT', payload: processed });
      break;

    default:
      postMessage({ id, type: 'ERROR', payload: `Unknown operation: ${type}` });
  }
});

function filterData(data: any[], filters: Record<string, any>): any[] {
  if (!filters || Object.keys(filters).length === 0) return data;

  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;

      const itemValue = getNestedValue(item, key);

      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }

      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }

      return itemValue === value;
    });
  });
}

function sortData(data: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): any[] {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy);
    const bValue = getNestedValue(b, sortBy);

    if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return sortOrder === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
}

function paginateData(
  data: any[],
  page: number,
  limit: number,
): {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: data.slice(start, end),
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
  };
}

function searchData(data: any[], query: string, fields: string[]): any[] {
  if (!query || !fields || fields.length === 0) return data;

  const lowerQuery = query.toLowerCase();

  return data.filter((item) => {
    return fields.some((field) => {
      const value = getNestedValue(item, field);
      return (
        value !== null && value !== undefined && String(value).toLowerCase().includes(lowerQuery)
      );
    });
  });
}

function aggregateData(
  data: any[],
  field: string,
  operation: 'sum' | 'avg' | 'min' | 'max' | 'count',
): any {
  const values = data
    .map((item) => getNestedValue(item, field))
    .filter((v) => v !== null && v !== undefined);

  if (values.length === 0) return operation === 'count' ? 0 : null;

  switch (operation) {
    case 'sum':
      return values.reduce((sum, val) => sum + Number(val), 0);
    case 'avg':
      return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
    case 'min':
      return Math.min(...values.map(Number));
    case 'max':
      return Math.max(...values.map(Number));
    case 'count':
      return values.length;
    default:
      return null;
  }
}

function groupByField(data: any[], field: string): Record<string, any[]> {
  return data.reduce((groups, item) => {
    const key = String(getNestedValue(item, field) ?? 'undefined');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

function exportToCsv(data: any[], columns: { key: string; label: string }[]): string {
  if (!data || data.length === 0) return '';

  const headers = columns.map((col) => `"${col.label}"`).join(',');
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = getNestedValue(item, col.key);
        const stringValue = value === null || value === undefined ? '' : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headers, ...rows].join('\n');
}

function prepareExcelData(data: any[]): { headers: string[]; rows: any[][] } {
  if (!data || data.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((item) => headers.map((header) => item[header]));

  return { headers, rows };
}

function processLargeDataset(data: any[], operations: any[]): any {
  let result = [...data];

  for (const op of operations) {
    switch (op.type) {
      case 'filter':
        result = filterData(result, op.filters);
        break;
      case 'sort':
        result = sortData(result, op.sortBy, op.sortOrder);
        break;
      case 'paginate':
        result = paginateData(result, op.page, op.limit).data;
        break;
      case 'search':
        result = searchData(result, op.query, op.fields);
        break;
    }
  }

  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
