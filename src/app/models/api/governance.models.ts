import { IncidentStatus } from '../nhs.models';

export interface UnanonymizeRequest {
  submissionId: string;
  gmcNumber: string;
  legalJustification: string;
}

export interface UpdateIncidentStatusRequest {
  submissionId: string;
  status: IncidentStatus;
  investigationNotes?: string;
}

export interface AuditLogDto {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  targetId: string;
  justification: string;
  details: string;
}
