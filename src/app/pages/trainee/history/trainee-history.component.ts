import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonBadge, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkDoneCircleOutline, alertCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-trainee-history',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonBadge, IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Submissions</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">
        <p style="font-size: 0.88rem; color: #768692; margin: 4px 8px 16px;">
          Receipt records of feedback submitted for your training placements. These serve as verified evidence for your e-Portfolio and ARCP.
        </p>

        @for (sub of mySubmissions(); track sub.id) {
          <ion-card style="margin: 0 0 12px;">
            <ion-card-header style="padding-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="nhs-tag nhs-tag-green">
                  <ion-icon name="checkmark-done-circle-outline"></ion-icon>
                  Submitted
                </span>
                <span style="font-size: 0.78rem; color: #768692;">{{ sub.submittedAt }}</span>
              </div>
              <ion-card-title style="font-size: 1rem; color: #212b32;">
                {{ sub.surveyTitle }}
              </ion-card-title>
              <ion-card-subtitle style="font-size: 0.82rem; color: #005eb8; margin-top: 4px;">
                {{ sub.hospitalName }} &bull; {{ sub.departmentName }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid #e8edee;">
                <span style="font-size: 0.78rem; color: #768692;">
                  Answers Recorded: <strong>{{ sub.answers.length }}</strong>
                </span>
                @if (sub.incident.isFlagged) {
                  <ion-badge color="danger" style="display: flex; align-items: center; gap: 4px;">
                    <ion-icon name="alert-circle-outline"></ion-icon>
                    Safety Escalation
                  </ion-badge>
                } @else {
                  <span style="font-size: 0.78rem; color: #007f3b; font-weight: 600;">
                    &check; Sealed & Anonymized
                  </span>
                }
              </div>
            </ion-card-content>
          </ion-card>
        } @empty {
          <div style="text-align: center; padding: 48px 16px; color: #768692;">
            <ion-icon name="shield-checkmark-outline" style="font-size: 48px; color: #005eb8; margin-bottom: 8px;"></ion-icon>
            <h4 style="margin: 0; color: #212b32;">No Submissions Yet</h4>
            <p style="font-size: 0.85rem; margin-top: 4px;">Complete your pending forms in the Inbox tab.</p>
          </div>
        }
      </div>
    </ion-content>
  `
})
export class TraineeHistoryComponent {
  private mockData = inject(MockDataService);
  private auth = inject(AuthService);

  readonly mySubmissions = computed(() => {
    const currentId = this.auth.currentUser().id;
    return this.mockData.submissions().filter((s) => s.traineeId === currentId);
  });

  constructor() {
    addIcons({ checkmarkDoneCircleOutline, alertCircleOutline, shieldCheckmarkOutline });
  }
}
