import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonButton, IonIcon,
  IonSegment, IonSegmentButton, IonLabel, ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  timeOutline, arrowForwardOutline, checkmarkDoneCircleOutline,
  alertCircleOutline, eyeOutline, calendarOutline, closeCircleOutline
} from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { Survey, SurveySubmission } from '../../../models/nhs.models';
import { SurveyModalComponent } from '../survey-modal/survey-modal.component';
import { ViewAnswersModalComponent } from '../view-answers-modal/view-answers-modal.component';

export type FeedbackStatus = 'submitted' | 'not_submitted' | 'passed_deadline';

export interface TraineeFeedbackItem {
  survey: Survey;
  status: FeedbackStatus;
  submission?: SurveySubmission;
  displayDate: string;
}

@Component({
  selector: 'app-trainee-feedback',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonButton, IonIcon,
    IonSegment, IonSegmentButton, IonLabel
  ],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">
        <!-- Placement Summary Banner -->
        <ion-card style="background: linear-gradient(135deg, #005eb8 0%, #003087 100%); color: white; margin: 0 0 16px;">
          <ion-card-content style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="nhs-tag" style="background: rgba(255,255,255,0.2); color: white; border: none; margin-bottom: 6px;">
                  Current Placement
                </span>
                <h2 style="margin: 4px 0; font-size: 1.15rem; font-weight: 700; color: white;">
                  The Royal London Hospital
                </h2>
                <p style="margin: 0; font-size: 0.82rem; opacity: 0.9;">
                  Barts Health Trust &bull; North East London (NEL)
                </p>
              </div>
              <span class="nhs-tag" style="background: #ffffff; color: #003087; font-weight: 700;">
                ST3 &bull; Paeds
              </span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Status Filter Segment -->
        <ion-segment
          [(ngModel)]="selectedFilter"
          style="background: #ffffff; border-radius: 8px; margin-bottom: 14px; border: 1px solid #cbd5e1;"
        >
          <ion-segment-button value="all">
            <ion-label style="font-size: 0.8rem; font-weight: 600;">All ({{ allFeedback().length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="not_submitted">
            <ion-label style="font-size: 0.8rem; font-weight: 600; color: #005eb8;">To Do ({{ countPending() }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="submitted">
            <ion-label style="font-size: 0.8rem; font-weight: 600; color: #007f3b;">Submitted ({{ countSubmitted() }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="passed_deadline">
            <ion-label style="font-size: 0.8rem; font-weight: 600; color: #768692;">Closed ({{ countPassed() }})</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Feedback Items List (Sorted by date) -->
        @for (item of filteredFeedback(); track item.survey.id) {
          <ion-card
            [style.cursor]="item.status !== 'passed_deadline' ? 'pointer' : 'default'"
            [style.border]="item.status === 'not_submitted' ? '2px solid #005eb8' : '1px solid #cbd5e1'"
            (click)="handleItemClick(item)"
            style="margin: 0 0 14px; transition: transform 0.15s ease;"
          >
            <ion-card-header style="padding-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
                <!-- Status Badge -->
                @if (item.status === 'submitted') {
                  <span class="nhs-tag nhs-tag-green">
                    <ion-icon name="checkmark-done-circle-outline"></ion-icon>
                    Submitted
                  </span>
                }
                @if (item.status === 'not_submitted') {
                  <span class="nhs-tag nhs-tag-blue">
                    <ion-icon name="time-outline"></ion-icon>
                    Not Submitted &bull; Action Required
                  </span>
                }
                @if (item.status === 'passed_deadline') {
                  <span class="nhs-tag" style="background: #e2e8f0; color: #64748b; border: 1px solid #cbd5e1;">
                    <ion-icon name="close-circle-outline"></ion-icon>
                    Passed Deadline
                  </span>
                }

                <span style="font-size: 0.78rem; color: #768692;">
                  {{ item.status === 'submitted' ? 'Submitted ' + item.displayDate : 'Deadline ' + item.displayDate }}
                </span>
              </div>

              <ion-card-title style="font-size: 1.05rem; color: #212b32; line-height: 1.3;">
                {{ item.survey.title }}
              </ion-card-title>
              <ion-card-subtitle style="font-size: 0.8rem; color: #768692; margin-top: 3px;">
                Published by {{ item.survey.creatorName }} &bull; ~{{ item.survey.estimatedMinutes }} mins
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <p style="font-size: 0.85rem; color: #425563; line-height: 1.4; margin-bottom: 12px;">
                {{ item.survey.description }}
              </p>

              <!-- Action Footer -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e8edee;">
                @if (item.status === 'submitted') {
                  <span style="font-size: 0.8rem; color: #007f3b; font-weight: 600;">
                    &check; Click to view your submitted answers
                  </span>
                  <ion-button size="small" fill="outline" color="success">
                    <ion-icon name="eye-outline" slot="start"></ion-icon>
                    View Answers
                  </ion-button>
                }

                @if (item.status === 'not_submitted') {
                  <span style="font-size: 0.8rem; color: #005eb8; font-weight: 600;">
                    &bull; Anonymous &bull; {{ item.survey.questions.length }} Questions
                  </span>
                  <ion-button size="small" color="primary">
                    Start Survey
                    <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
                  </ion-button>
                }

                @if (item.status === 'passed_deadline') {
                  <span style="font-size: 0.8rem; color: #768692; font-style: italic;">
                    Feedback cycle closed for this rotation.
                  </span>
                  <span class="nhs-tag" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;">Closed</span>
                }
              </div>
            </ion-card-content>
          </ion-card>
        } @empty {
          <div style="text-align: center; padding: 48px 16px; color: #768692; background: white; border-radius: 12px;">
            <p style="margin: 0; font-size: 0.95rem;">No feedback forms match this filter.</p>
          </div>
        }
      </div>
    </ion-content>
  `
})
export class TraineeFeedbackComponent {
  private mockData = inject(MockDataService);
  private auth = inject(AuthService);
  private modalCtrl = inject(ModalController);

  selectedFilter = 'all';

  constructor() {
    addIcons({
      timeOutline, arrowForwardOutline, checkmarkDoneCircleOutline,
      alertCircleOutline, eyeOutline, calendarOutline, closeCircleOutline
    });
  }

  readonly allFeedback = computed<TraineeFeedbackItem[]>(() => {
    const currentUserId = this.auth.currentUser()?.id || 'usr-trainee-1';
    const surveys = this.mockData.surveys();
    const submissions = this.mockData.submissions();
    const today = new Date().toISOString().substring(0, 10);

    const items: TraineeFeedbackItem[] = surveys.map((srv) => {
      const mySub = submissions.find((sub) => sub.surveyId === srv.id && sub.traineeId === currentUserId);
      if (mySub) {
        return {
          survey: srv,
          status: 'submitted',
          submission: mySub,
          displayDate: mySub.submittedAt
        };
      }
      if (srv.deadline < today) {
        return {
          survey: srv,
          status: 'passed_deadline',
          displayDate: srv.deadline
        };
      }
      return {
        survey: srv,
        status: 'not_submitted',
        displayDate: srv.deadline
      };
    });

    // Sort initially by date (latest first)
    return items.sort((a, b) => b.displayDate.localeCompare(a.displayDate));
  });

  readonly countPending = computed(() =>
    this.allFeedback().filter((i) => i.status === 'not_submitted').length
  );

  readonly countSubmitted = computed(() =>
    this.allFeedback().filter((i) => i.status === 'submitted').length
  );

  readonly countPassed = computed(() =>
    this.allFeedback().filter((i) => i.status === 'passed_deadline').length
  );

  readonly filteredFeedback = computed(() => {
    const list = this.allFeedback();
    if (this.selectedFilter === 'all') return list;
    return list.filter((i) => i.status === this.selectedFilter);
  });

  async handleItemClick(item: TraineeFeedbackItem) {
    if (item.status === 'submitted' && item.submission) {
      const modal = await this.modalCtrl.create({
        component: ViewAnswersModalComponent,
        componentProps: { submission: item.submission }
      });
      await modal.present();
    } else if (item.status === 'not_submitted') {
      const modal = await this.modalCtrl.create({
        component: SurveyModalComponent,
        componentProps: { survey: item.survey }
      });
      await modal.present();
    }
  }
}
