import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, peopleOutline, calendarOutline, barChartOutline, arrowForwardOutline } from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-rep-campaigns',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonButton, IonIcon
  ],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">

        <!-- Header Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 16px;">
          <div style="background: white; border-radius: 10px; padding: 12px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 1.5rem; font-weight: 800; color: #005eb8;">{{ surveys().length }}</div>
            <div style="font-size: 0.72rem; color: #768692; text-transform: uppercase;">Active Surveys</div>
          </div>
          <div style="background: white; border-radius: 10px; padding: 12px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 1.5rem; font-weight: 800; color: #007f3b;">{{ totalSubmissions() }}</div>
            <div style="font-size: 0.72rem; color: #768692; text-transform: uppercase;">Total Responses</div>
          </div>
          <div style="background: white; border-radius: 10px; padding: 12px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 1.5rem; font-weight: 800; color: #003087;">London</div>
            <div style="font-size: 0.72rem; color: #768692; text-transform: uppercase;">Coverage</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #003087;">
              Regional Feedback Surveys
            </h2>
            <p style="margin: 2px 0 0; font-size: 0.8rem; color: #64748b;">
              Click any survey to view its targeted analytics and responses.
            </p>
          </div>
          <ion-button color="primary" size="small" (click)="goToBuilder()">
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            New Survey
          </ion-button>
        </div>

        @for (survey of surveys(); track survey.id) {
          <ion-card
            style="margin: 0 0 16px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;"
            (click)="viewSurveyAnalytics(survey.id)"
          >
            <ion-card-header style="padding-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="nhs-tag nhs-tag-blue">Active Campaign</span>
                <span style="font-size: 0.78rem; color: #768692;">Closes {{ survey.deadline }}</span>
              </div>
              <ion-card-title style="font-size: 1.05rem; color: #212b32; font-weight: 700;">
                {{ survey.title }}
              </ion-card-title>
              <ion-card-subtitle style="font-size: 0.8rem; color: #768692; margin-top: 4px;">
                Target: {{ survey.target.allSectors ? 'All London Sectors' : 'NEL & NCL Sectors' }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <p style="font-size: 0.85rem; color: #425563; line-height: 1.4; margin-bottom: 14px;">
                {{ survey.description }}
              </p>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #e8edee;">
                <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.9rem; color: #005eb8;">
                  <ion-icon name="people-outline"></ion-icon>
                  <span>{{ getSurveyResponseCount(survey.id) }} Submissions</span>
                </div>

                <ion-button
                  fill="outline"
                  size="small"
                  color="primary"
                  (click)="$event.stopPropagation(); viewSurveyAnalytics(survey.id)"
                >
                  <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
                  View Analytics
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        }
      </div>
    </ion-content>
  `
})
export class RepCampaignsComponent {
  private mockData = inject(MockDataService);
  private router = inject(Router);

  readonly surveys = this.mockData.surveys;

  readonly totalSubmissions = computed(() => {
    return this.mockData.submissions().length;
  });

  constructor() {
    addIcons({ addCircleOutline, peopleOutline, calendarOutline, barChartOutline, arrowForwardOutline });
  }

  getSurveyResponseCount(surveyId: string): number {
    return this.mockData.submissions().filter(s => s.surveyId === surveyId).length;
  }

  goToBuilder() {
    this.router.navigate(['/tabs/rep-builder']);
  }

  viewSurveyAnalytics(surveyId: string) {
    this.router.navigate(['/tabs/rep-responses'], {
      queryParams: { surveyId }
    });
  }
}
