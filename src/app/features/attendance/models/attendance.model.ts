export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
  WEEKLY_OFF = 'weekly_off',
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  status: AttendanceStatus;
  remarks?: string;
  lateMinutes?: number;
  overtimeHours?: number;
}

export interface AttendanceSummary {
  employeeId: number;
  employeeName?: string;
  month: number;
  year: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  holidays: number;
  weeklyOff: number;
  totalWorkDays: number;
  attendancePercentage: number;
}

export interface AttendanceFilter {
  employeeId?: number;
  departmentId?: number;
  fromDate?: string;
  toDate?: string;
  status?: AttendanceStatus;
}

export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  const labels: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'Present',
    [AttendanceStatus.ABSENT]: 'Absent',
    [AttendanceStatus.LATE]: 'Late',
    [AttendanceStatus.HALF_DAY]: 'Half Day',
    [AttendanceStatus.ON_LEAVE]: 'On Leave',
    [AttendanceStatus.HOLIDAY]: 'Holiday',
    [AttendanceStatus.WEEKLY_OFF]: 'Weekly Off',
  };
  return labels[status] || status;
}

export function getAttendanceStatusColor(status: AttendanceStatus): string {
  const colors: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: 'success',
    [AttendanceStatus.ABSENT]: 'danger',
    [AttendanceStatus.LATE]: 'warning',
    [AttendanceStatus.HALF_DAY]: 'info',
    [AttendanceStatus.ON_LEAVE]: 'primary',
    [AttendanceStatus.HOLIDAY]: 'purple',
    [AttendanceStatus.WEEKLY_OFF]: 'secondary',
  };
  return colors[status] || 'secondary';
}
