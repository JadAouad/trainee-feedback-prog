import { QuestionType, SurveyTarget, SurveyQuestion, Survey } from '../nhs.models';
import { PaginationQuery } from './common.models';

export interface SurveyListQuery extends PaginationQuery {
  status?: 'active' | 'draft' | 'closed';
  sectorId?: string;
  hospitalId?: string;
  search?: string;
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  estimatedMinutes: number;
  deadline: string;
  target: SurveyTarget;
  questions: SurveyQuestion[];
}

export interface UpdateSurveyRequest extends Partial<CreateSurveyRequest> {
  status?: 'active' | 'draft' | 'closed';
}

export interface SurveySummaryDto {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  estimatedMinutes: number;
  deadline: string;
  status: 'active' | 'draft' | 'closed';
  responseCount: number;
  createdAt: string;
  target: SurveyTarget;
}
