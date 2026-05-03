export enum CycleType {
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

export enum CycleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SELF_RATING_OPEN = 'self_rating_open',
  SELF_RATING_CLOSED = 'self_rating_closed',
  MANAGER_RATING_OPEN = 'manager_rating_open',
  MANAGER_RATING_CLOSED = 'manager_rating_closed',
  HR_REVIEW = 'hr_review',
  COMPLETED = 'completed',
}

export enum GoalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RatingScale {
  POOR = 1,
  BELOW_EXPECTATIONS = 2,
  MEETS_EXPECTATIONS = 3,
  EXCEEDS_EXPECTATIONS = 4,
  OUTSTANDING = 5,
}

export interface PerformanceCycle {
  id: number;
  cycle_name: string;
  cycle_code: string;
  cycle_type: CycleType;
  fiscal_year: number;
  quarter?: number;
  start_date: string;
  end_date: string;
  self_rating_start: string;
  self_rating_end: string;
  manager_rating_start: string;
  manager_rating_end: string;
  status: CycleStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: number;
  cycle_id: number;
  employee_id: number;
  employee_name?: string;
  goal_title: string;
  goal_description?: string;
  kpi_description?: string;
  target_value?: string;
  weightage?: number;
  priority: GoalPriority;
  status: GoalStatus;
  self_rating?: SelfRating;
  manager_rating?: ManagerRating;
  created_at?: string;
  updated_at?: string;
}

export interface SelfRating {
  id?: number;
  goal_id: number;
  self_rating: number;
  achievement_summary?: string;
  what_achieved?: string;
  what_missed?: string;
  challenges_faced?: string;
  submitted_at?: string;
}

export interface ManagerRating {
  id?: number;
  goal_id: number;
  manager_rating: number;
  manager_comments?: string;
  what_employee_did_well?: string;
  areas_of_improvement?: string;
  manager_feedback?: string;
  submitted_at?: string;
}

export interface OverallRating {
  id?: number;
  cycle_id: number;
  employee_id: number;
  employee_name?: string;
  manager_summary?: string;
  employee_comments?: string;
  hr_comments?: string;
  rating_category?: string;
  average_self_rating?: number;
  average_manager_rating?: number;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualSummary {
  id?: number;
  fiscal_year: number;
  employee_id: number;
  employee_name?: string;
  overall_rating?: number;
  summary?: string;
  achievements?: string;
  areas_for_improvement?: string;
  goals_completed?: number;
  total_goals?: number;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCycleDto {
  cycle_name: string;
  cycle_code: string;
  cycle_type: CycleType;
  fiscal_year: number;
  quarter?: number;
  start_date: string;
  end_date: string;
  self_rating_start: string;
  self_rating_end: string;
  manager_rating_start: string;
  manager_rating_end: string;
}

export interface UpdateCycleDto {
  cycle_name?: string;
  status?: CycleStatus;
}

export interface UpdateCycleStatusDto {
  status: CycleStatus;
}

export interface CreateGoalDto {
  cycle_id: number;
  employee_id: number;
  goal_title: string;
  goal_description?: string;
  kpi_description?: string;
  target_value?: string;
  weightage?: number;
  priority: GoalPriority;
}

export interface UpdateGoalDto {
  goal_title?: string;
  goal_description?: string;
  status?: GoalStatus;
}

export interface CreateSelfRatingDto {
  self_rating: number;
  achievement_summary?: string;
  what_achieved?: string;
  what_missed?: string;
  challenges_faced?: string;
}

export interface CreateManagerRatingDto {
  manager_rating: number;
  manager_comments?: string;
  what_employee_did_well?: string;
  areas_of_improvement?: string;
  manager_feedback?: string;
}

export interface UpdateOverallRatingDto {
  manager_summary?: string;
  employee_comments?: string;
  hr_comments?: string;
  rating_category?: string;
}

export function getCycleStatusLabel(status: CycleStatus): string {
  const labels: Record<CycleStatus, string> = {
    [CycleStatus.DRAFT]: 'Draft',
    [CycleStatus.ACTIVE]: 'Active',
    [CycleStatus.SELF_RATING_OPEN]: 'Self Rating Open',
    [CycleStatus.SELF_RATING_CLOSED]: 'Self Rating Closed',
    [CycleStatus.MANAGER_RATING_OPEN]: 'Manager Rating Open',
    [CycleStatus.MANAGER_RATING_CLOSED]: 'Manager Rating Closed',
    [CycleStatus.HR_REVIEW]: 'HR Review',
    [CycleStatus.COMPLETED]: 'Completed',
  };
  return labels[status] || status;
}

export function getGoalStatusLabel(status: GoalStatus): string {
  const labels: Record<GoalStatus, string> = {
    [GoalStatus.PENDING]: 'Pending',
    [GoalStatus.IN_PROGRESS]: 'In Progress',
    [GoalStatus.COMPLETED]: 'Completed',
    [GoalStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status] || status;
}

export function getPriorityLabel(priority: GoalPriority): string {
  const labels: Record<GoalPriority, string> = {
    [GoalPriority.LOW]: 'Low',
    [GoalPriority.MEDIUM]: 'Medium',
    [GoalPriority.HIGH]: 'High',
    [GoalPriority.CRITICAL]: 'Critical',
  };
  return labels[priority] || priority;
}

export function getRatingLabel(rating?: number): string {
  if (!rating) return 'N/A';
  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Below Expectations',
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Outstanding',
  };
  return labels[rating] || 'N/A';
}

export function getRatingBadgeClass(rating?: number): string {
  if (!rating) return 'bg-secondary';
  const classes: Record<number, string> = {
    1: 'bg-danger',
    2: 'bg-warning',
    3: 'bg-info',
    4: 'bg-primary',
    5: 'bg-success',
  };
  return classes[rating] || 'bg-secondary';
}
