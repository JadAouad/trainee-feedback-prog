export type UserRole = 'trainee' | 'rep' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  sectorId?: string;
  trustId?: string;
  hospitalId?: string;
  grade?: string;
  specialty?: string;
  assignedSectors?: string[];
  repApproved?: boolean;
}

export interface Sector {
  id: string;
  name: string;
  code: string;
}

export interface Trust {
  id: string;
  sectorId: string;
  name: string;
  code: string;
}

export interface Hospital {
  id: string;
  trustId: string;
  sectorId: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export type QuestionType = 'rating' | 'single_choice' | 'multiple_choice' | 'text';

export interface SurveyQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
  labels?: { min: string; max: string };
}

export interface SurveyTarget {
  allSectors: boolean;
  sectorIds: string[];
  hospitalIds: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  target: SurveyTarget;
  questions: SurveyQuestion[];
  estimatedMinutes: number;
  deadline: string;
  status: 'active' | 'draft' | 'closed';
  responseCount: number;
  createdAt: string;
}

export interface SurveyAnswer {
  questionId: string;
  value: any;
}

export type IncidentStatus = 'pending_review' | 'under_investigation' | 'resolved';

export interface IncidentEscalation {
  isFlagged: boolean;
  concernSummary?: string;
  status?: IncidentStatus;
  isUnanonymized: boolean;
  unanonymizedAt?: string;
  unanonymizedBy?: string;
  unanonymizedReason?: string;
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  surveyTitle: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  sectorId: string;
  hospitalId: string;
  hospitalName: string;
  departmentName: string;
  grade: string;
  submittedAt: string;
  answers: SurveyAnswer[];
  incident: IncidentEscalation;
}

export interface RepApprovalRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  requestedSectors: string[];
  gmcNumber: string;
  currentHospital: string;
  trainingGrade: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  gmcVerified?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  targetId: string;
  justification: string;
  details: string;
}
