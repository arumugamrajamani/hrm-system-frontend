export enum GoalStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AppraisalStatus {
  DRAFT = 'draft',
  SELF_REVIEW = 'self_review',
  MANAGER_REVIEW = 'manager_review',
  SKIP_LEVEL_REVIEW = 'skip_level_review',
  CALIBRATION = 'calibration',
  COMPLETED = 'completed',
  LOCKED = 'locked',
}

export enum RatingScale {
  POOR = 1,
  BELOW_EXPECTATIONS = 2,
  MEETS_EXPECTATIONS = 3,
  EXCEEDS_EXPECTATIONS = 4,
  OUTSTANDING = 5,
}

export interface Goal {
  id: number;
  employeeId: number;
  employeeName?: string;
  title: string;
  description?: string;
  category: 'business' | 'personal' | 'team' | 'project';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: GoalStatus;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  weightage: number;
  managerId?: number;
  managerName?: string;
  progress: number;
  selfRating?: RatingScale;
  managerRating?: RatingScale;
  finalRating?: RatingScale;
  remarks?: string;
}

export interface KRA {
  id: number;
  employeeId: number;
  title: string;
  description?: string;
  weightage: number;
  goals?: Goal[];
  selfRating?: RatingScale;
  managerRating?: RatingScale;
}

export interface KPI {
  id: number;
  name: string;
  description?: string;
  category: string;
  measurementType: 'numeric' | 'percentage' | 'boolean' | 'rating';
  targetValue?: number;
  actualValue?: number;
  unit?: string;
  isActive: boolean;
}

export interface AppraisalCycle {
  id: number;
  name: string;
  period: {
    from: string;
    to: string;
  };
  status: 'draft' | 'active' | 'completed' | 'locked';
  selfReviewStart: string;
  selfReviewEnd: string;
  managerReviewStart: string;
  managerReviewEnd: string;
  calibrationStart?: string;
  calibrationEnd?: string;
  totalEmployees: number;
  completedReviews: number;
}

export interface Appraisal {
  id: number;
  cycleId: number;
  employeeId: number;
  employeeName?: string;
  departmentName?: string;
  designationName?: string;
  status: AppraisalStatus;
  selfReview?: ReviewData;
  managerReview?: ReviewData;
  skipLevelReview?: ReviewData;
  finalRating?: RatingScale;
  finalRemarks?: string;
  completedAt?: string;
}

export interface ReviewData {
  overallRating?: RatingScale;
  strengths?: string[];
  areasForImprovement?: string[];
  comments?: string;
  goalsReview: { goalId: number; rating: RatingScale; comments?: string }[];
  kraReview: { kraId: number; rating: RatingScale; comments?: string }[];
  reviewedBy?: number;
  reviewedByName?: string;
  reviewedAt?: string;
}

export interface TrainingRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  title: string;
  type: 'internal' | 'external' | 'online' | 'certification';
  provider?: string;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  certificateUrl?: string;
}

export interface SuccessionPlan {
  id: number;
  positionId: number;
  positionName: string;
  incumbentId?: number;
  incumbentName?: string;
  successors: Successor[];
  readiness: 'immediate' | '1_year' | '2_years' | 'developing';
}

export interface Successor {
  id: number;
  employeeId: number;
  employeeName: string;
  readiness: 'immediate' | '1_year' | '2_years' | 'developing';
  developmentPlan?: string;
}

export function getGoalStatusLabel(status: GoalStatus): string {
  const labels: Record<GoalStatus, string> = {
    [GoalStatus.DRAFT]: 'Draft',
    [GoalStatus.IN_PROGRESS]: 'In Progress',
    [GoalStatus.COMPLETED]: 'Completed',
    [GoalStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status] || status;
}

export function getAppraisalStatusLabel(status: AppraisalStatus): string {
  const labels: Record<AppraisalStatus, string> = {
    [AppraisalStatus.DRAFT]: 'Draft',
    [AppraisalStatus.SELF_REVIEW]: 'Self Review',
    [AppraisalStatus.MANAGER_REVIEW]: 'Manager Review',
    [AppraisalStatus.SKIP_LEVEL_REVIEW]: 'Skip Level Review',
    [AppraisalStatus.CALIBRATION]: 'Calibration',
    [AppraisalStatus.COMPLETED]: 'Completed',
    [AppraisalStatus.LOCKED]: 'Locked',
  };
  return labels[status] || status;
}

export function getRatingLabel(rating?: RatingScale): string {
  if (!rating) return 'N/A';
  const labels: Record<RatingScale, string> = {
    [RatingScale.POOR]: 'Poor',
    [RatingScale.BELOW_EXPECTATIONS]: 'Below Expectations',
    [RatingScale.MEETS_EXPECTATIONS]: 'Meets Expectations',
    [RatingScale.EXCEEDS_EXPECTATIONS]: 'Exceeds Expectations',
    [RatingScale.OUTSTANDING]: 'Outstanding',
  };
  return labels[rating] || 'N/A';
}

export function getGoalCategoryLabel(category: Goal['category']): string {
  const labels: Record<Goal['category'], string> = {
    business: 'Business',
    personal: 'Personal',
    team: 'Team',
    project: 'Project',
  };
  return labels[category] || category;
}

export function getPriorityLabel(priority: Goal['priority']): string {
  const labels: Record<Goal['priority'], string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[priority] || priority;
}
