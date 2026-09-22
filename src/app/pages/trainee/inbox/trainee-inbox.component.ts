import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonBadge, IonIcon, IonRefresher, IonRefresherContent,
  ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline, arrowForwardOutline, checkmarkDoneOutline, schoolOutline } from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { Survey } from '../../../models/nhs.models';
import { SurveyModalComponent } from '../survey-modal/survey-modal.component';

@Component({
  selector: 'app-trainee-inbox',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonButton, IonBadge, IonIcon, IonRefresher, IonRefresherContent
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Feedback Inbox</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="app-container">
        <ion-card style="background: linear-gradient(135deg, #005eb8 0%, #003087 100%); color: white; margin: 0 0 16px;">
          <ion-card-content style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="nhs-tag nhs-tag-blue" style="background: rgba(255,255,255,0.2); color: white; border: none; margin-bottom: 6px;">
                  Current Placement
                </span>
                <h2 style="margin: 4px 0; font-size: 1.2rem; font-weight: 700; color: white;">
                  The Royal London Hospital
                </h2>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">
                  Barts Health NHS Trust &bull; North East London (NEL)
                </p>
              </div>
              <ion-badge color="light" style="color: #003087; font-weight: 700; padding: 6px 10px;">
                {{ currentUser().grade }} &bull; Paeds
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 4px 8px;">
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #003087;">
            Surveys Awaiting Your Input
          </h3>
          <ion-badge color="primary">{{ surveys().length }} Available</ion-badge>
        </div>

        @for (survey of surveys(); track survey.id) {
          <ion-card style="margin: 0 0 14px;">
            <ion-card-header style="padding-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="nhs-tag nhs-tag-blue">
                  {{ survey.target.allSectors ? 'London Wide' : 'NEL & NCL Regional' }}
                </span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #768692;">
                  <ion-icon name="time-outline"></ion-icon>
                  <span>~{{ survey.estimatedMinutes }} mins</span>
                </div>
              </div>
              <ion-card-title style="font-size: 1.05rem; color: #212b32; line-height: 1.3;">
                {{ survey.title }}
              </ion-card-title>
              <ion-card-subtitle style="font-size: 0.8rem; color: #768692; margin-top: 4px;">
                Published by {{ survey.creatorName }} &bull; Closes {{ survey.deadline }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content style="padding-top: 0;">
              <p style="font-size: 0.85rem; color: #425563; line-height: 1.4; margin-bottom: 12px;">
                {{ survey.description }}
              </p>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.78rem; color: #007f3b; font-weight: 600;">
                  &check; Anonymous Feedback
                </span>
                <ion-button color="primary" size="small" (click)="openSurvey(survey)" style="font-weight: 600;">
                  Start Survey
                  <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        }
      </div>
    </ion-content>
  `
})
export class TraineeInboxComponent {
  private mockData = inject(MockDataService);
  private auth = inject(AuthService);
  private modalCtrl = inject(ModalController);

  readonly surveys = this.mockData.surveys;
  readonly currentUser = this.auth.currentUser;

  constructor() {
    addIcons({ timeOutline, arrowForwardOutline, checkmarkDoneOutline, schoolOutline });
  }

  handleRefresh(event: any) {
    setTimeout(() => event.target.complete(), 600);
  }

  async openSurvey(survey: Survey) {
    const modal = await this.modalCtrl.create({
      component: SurveyModalComponent,
      componentProps: { survey }
    });
    await modal.present();
  }
}
