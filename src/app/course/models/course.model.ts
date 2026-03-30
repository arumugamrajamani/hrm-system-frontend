export interface Course {
  id?: number;
  course_name: string;
  course_code: string;
  description?: string;
  status: 'active' | 'inactive';
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  created_by_username?: string;
  updated_by_username?: string;
}

export interface CoursePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CourseApiResponse {
  success: boolean;
  message: string;
  data?: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleCourseApiResponse {
  success: boolean;
  message: string;
  data?: Course;
}
