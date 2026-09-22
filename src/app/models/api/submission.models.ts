import { SurveyAnswer, IncidentStatus } from '../nhs.models';
import { PaginationQuery } from './common.models';

export interface SubmitFeedbackRequest {
  surveyId: string;
  hospitalId: string;
  departmentName: string;
  grade: string;
  answers: SurveyAnswer[];
  isFlagged: boolean;
  concernSummary?: string;
}

export interface SubmissionReceiptResponse {
  submissionId: string;
  surveyId: string;
  referenceNumber: string;
  submittedAt: string;
  isFlagged: boolean;
  status: 'received' | 'under_review';
  message: string;
}

export interface TraineeFeedbackQuery extends PaginationQuery {
  status?: 'all' | 'submitted' | 'not_submitted' | 'passed_deadline';
  search?: string;
}
