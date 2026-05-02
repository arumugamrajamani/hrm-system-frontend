export interface Shift {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  breakDuration?: number;
  isFlexible: boolean;
  gracePeriodMinutes?: number;
  lateThresholdMinutes?: number;
  color?: string;
  description?: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  employeeCount?: number;
}

export interface ShiftFilters {
  search?: string;
  status?: 'active' | 'inactive';
  isFlexible?: boolean;
}

export interface CreateShiftDto {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  breakDuration?: number;
  isFlexible: boolean;
  gracePeriodMinutes?: number;
  lateThresholdMinutes?: number;
  color?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
