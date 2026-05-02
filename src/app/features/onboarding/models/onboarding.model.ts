export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OnboardingCandidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  location?: string;
  joiningDate: string;
  status: OnboardingStatus;
  offerAccepted: boolean;
  offerAcceptedDate?: string;
  documentsSubmitted: number;
  documentsRequired: number;
  checklistProgress: number;
  assignedHR?: string;
  assignedManager?: string;
}

export interface OnboardingChecklist {
  id: number;
  candidateId: number;
  title: string;
  description?: string;
  assignedTo: string;
  assignedRole: 'hr' | 'it' | 'admin' | 'manager';
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  category: 'document' | 'it_setup' | 'admin' | 'induction' | 'other';
  order: number;
}

export interface OnboardingDocument {
  id: number;
  candidateId: number;
  documentType: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface OnboardingTemplate {
  id: number;
  name: string;
  description?: string;
  applicableDepartments?: number[];
  applicableLocations?: number[];
  applicableRoles?: string[];
  checklistItems: OnboardingChecklistTemplateItem[];
  isActive: boolean;
}

export interface OnboardingChecklistTemplateItem {
  id: number;
  templateId: number;
  title: string;
  description?: string;
  assignedRole: 'hr' | 'it' | 'admin' | 'manager';
  category: 'document' | 'it_setup' | 'admin' | 'induction' | 'other';
  isRequired: boolean;
  dueDateOffsetDays?: number;
  order: number;
}
