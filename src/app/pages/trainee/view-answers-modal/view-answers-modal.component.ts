import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonIcon, ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkDoneCircleOutline, alertCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { Survey, SurveySubmission } from '../../../models/nhs.models';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-view-answers-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Submitted Feedback</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <!-- Submission Receipt Header -->
      <div style="background: #e6f3eb; border: 1px solid #007f3b; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; gap: 10px; align-items: center;">
        <ion-icon name="checkmark-done-circle-outline" style="color: #007f3b; font-size: 26px; flex-shrink: 0;"></ion-icon>
        <div>
          <strong style="color: #007f3b; font-size: 0.92rem;">Verified Submission Record</strong>
          <div style="font-size: 0.8rem; color: #212b32; margin-top: 2px;">
            Submitted on {{ submission.submittedAt }} &bull; Anonymized per NHS governance protocol.
          </div>
        </div>
      </div>

      <!-- Placement & Survey Details -->
      <ion-card style="margin: 0 0 16px;">
        <ion-card-header style="padding-bottom: 6px;">
          <ion-card-title style="font-size: 1.05rem; color: #003087;">
            {{ submission.surveyTitle }}
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div style="font-size: 0.85rem; color: #425563; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Hospital:</strong> {{ submission.hospitalName }}</div>
            <div><strong>Department:</strong> {{ submission.departmentName }}</div>
            <div><strong>Training Grade:</strong> {{ submission.grade }}</div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Q and A Review -->
      <h3 style="margin: 0 4px 10px; font-size: 1rem; font-weight: 700; color: #003087;">
        Recorded Answers
      </h3>

      <ion-card style="margin: 0 0 16px;">
        <ion-card-content style="display: flex; flex-direction: column; gap: 14px; padding: 14px;">
          @for (ans of submission.answers; track ans.questionId) {
            <div style="font-size: 0.86rem; line-height: 1.4;">
              <div style="color: #003087; font-weight: 700; margin-bottom: 3px;">
                Q: {{ getQuestionText(submission.surveyId, ans.questionId) }}
              </div>
              <div style="color: #212b32; padding-left: 12px; border-left: 3px solid #005eb8;">
                <strong>A:</strong> {{ formatAnswer(ans.value) }}
              </div>
            </div>
          }
        </ion-card-content>
      </ion-card>

      <!-- Flagged Concern if present -->
      @if (submission.incident.isFlagged) {
        <ion-card style="margin: 0 0 24px; border: 1px solid #d5281b;">
          <ion-card-header style="background: #fbeae8; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 6px; color: #d5281b; font-weight: 700; font-size: 0.9rem;">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <span>Urgent Safety Concern Flagged</span>
            </div>
          </ion-card-header>
          <ion-card-content style="padding: 12px; font-size: 0.84rem; color: #661007;">
            <em>"{{ submission.incident.concernSummary || 'Concern escalated to Deanery Higher Admin.' }}"</em>
          </ion-card-content>
        </ion-card>
      }

      <ion-button expand="block" fill="outline" color="primary" (click)="dismiss()" style="margin-bottom: 24px;">
        Close Receipt
      </ion-button>
    </ion-content>
  `
})
export class ViewAnswersModalComponent {
  @Input() submission!: SurveySubmission;
  private modalCtrl = inject(ModalController);
  private mockData = inject(MockDataService);

  constructor() {
    addIcons({ closeOutline, checkmarkDoneCircleOutline, alertCircleOutline, shieldCheckmarkOutline });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getQuestionText(surveyId: string, questionId: string): string {
    const survey = this.mockData.surveys().find((s) => s.id === surveyId);
    if (survey) {
      const q = survey.questions.find((quest) => quest.id === questionId);
      if (q) return q.title;
    }
    return questionId;
  }

  formatAnswer(val: any): string {
    if (typeof val === 'number') {
      return val + ' / 5 Rating';
    }
    return String(val);
  }
}
