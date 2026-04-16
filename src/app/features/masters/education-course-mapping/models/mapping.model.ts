export interface EducationCourseMapping {
  id?: number;
  education_id: number;
  course_id: number;
  education_name: string;
  education_code: string;
  course_name: string;
  course_code: string;
  created_by?: number;
  created_at?: string;
  created_by_username?: string;
}

export interface EducationCourseMappingApiResponse {
  success: boolean;
  message: string;
  data?: EducationCourseMapping[];
}
