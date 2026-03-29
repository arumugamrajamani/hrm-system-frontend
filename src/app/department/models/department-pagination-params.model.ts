import { PaginationParams } from '../../core/models';

export interface DepartmentPaginationParams extends PaginationParams {
  status?: 'active' | 'inactive' | 'all';
}
