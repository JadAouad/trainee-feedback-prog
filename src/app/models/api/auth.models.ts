import { UserRole } from '../nhs.models';

export interface LoginRequest {
  email: string;
  passcode?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfileDto;
}

export interface UserProfileDto {
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

export interface RegisterRepRequest {
  name: string;
  email: string;
  gmcNumber: string;
  currentHospitalId: string;
  trainingGrade: string;
  requestedSectors: string[];
}
