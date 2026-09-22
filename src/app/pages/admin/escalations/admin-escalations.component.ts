import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonBadge, IonIcon,
  IonButton, IonSegment, IonSegmentButton, IonLabel,
  AlertController, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline, shieldCheckmarkOutline, lockClosedOutline,
  lockOpenOutline, personOutline, documentTextOutline, timeOutline,
  checkmarkCircleOutline, trashOutline
} from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { SurveySubmission, IncidentStatus } from '../../../models/nhs.models';

@Component({
  selector: 'app-admin-escalations',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader,
    IonCardContent, IonIcon,
    IonButton, IonSegment, IonSegmentButton, IonLabel
  ],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">

        <!-- Top Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h1 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #003087;">
              Safety Incident Escalations
            </h1>
            <p style="margin: 2px 0 0; font-size: 0.8rem; color: #475569;">
              Review patient safety escalations, manage investigation states, and unlock author identity.
            </p>
          </div>
        </div>

        <!-- Segment: Incident Queue vs Audit Trail -->
        <ion-segment [(ngModel)]="currentTab" style="background: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #cbd5e1;">
          <ion-segment-button value="queue">
            <ion-label style="font-size: 0.8rem; font-weight: 700;">
              Active Escalations ({{ flaggedSubmissions().length }})
            </ion-label>
          </ion-segment-button>
          <ion-segment-button value="audit">
            <ion-label style="font-size: 0.8rem; font-weight: 700;">
              Governance Audit Log ({{ mockData.auditLogs().length }})
            </ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- TAB 1: ACTIVE INCIDENT QUEUE -->
        @if (currentTab === 'queue') {
          @for (sub of flaggedSubmissions(); track sub.id) {
            <ion-card style="margin: 0 0 16px; border-left: 5px solid #d5281b;">
              <ion-card-header style="background: #fbeae8; padding-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <ion-icon name="alert-circle-outline" style="color: #d5281b; font-size: 20px;"></ion-icon>
                      <span style="font-weight: 800; color: #661007; font-size: 0.95rem;">
                        Patient Safety / Safeguarding Alert
                      </span>
                    </div>
                    <div style="font-size: 0.78rem; color: #768692; margin-top: 2px;">
                      Logged: {{ sub.submittedAt }} &bull; {{ sub.hospitalName }}
                    </div>
                  </div>

                  <span class="nhs-tag" [class]="getStatusTagClass(sub.incident.status)">
                    {{ sub.incident.status || 'pending_review' }}
                  </span>
                </div>
              </ion-card-header>

              <ion-card-content style="padding: 14px;">
                <!-- Summary of Concern -->
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase;">
                    Reported Concern Summary:
                  </span>
                  <p style="margin: 4px 0 0; font-size: 0.86rem; color: #1e293b; font-weight: 500;">
                    "{{ sub.incident.concernSummary || 'No summary provided by trainee.' }}"
                  </p>
                </div>

                <!-- Placement Context Details -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; font-size: 0.78rem; color: #475569; margin-bottom: 14px;">
                  <div><strong>Department:</strong> {{ sub.departmentName }}</div>
                  <div><strong>Hospital:</strong> {{ sub.hospitalName }}</div>
                  <div><strong>Training Grade:</strong> {{ sub.grade }}</div>
                  <div><strong>Submission Ref:</strong> {{ sub.id }}</div>
                </div>

                <!-- Trainee Identity Card -->
                <div style="border-radius: 8px; padding: 12px; margin-bottom: 14px;"
                     [style.background]="sub.incident.isUnanonymized ? '#e6f3eb' : '#f8fafc'"
                     [style.border]="sub.incident.isUnanonymized ? '1px solid #007f3b' : '1px solid #cbd5e1'">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <ion-icon [name]="sub.incident.isUnanonymized ? 'lock-open-outline' : 'lock-closed-outline'"
                                [style.color]="sub.incident.isUnanonymized ? '#007f3b' : '#64748b'"></ion-icon>
                      <span style="font-weight: 700; font-size: 0.85rem;"
                            [style.color]="sub.incident.isUnanonymized ? '#007f3b' : '#334155'">
                        Author Identity: {{ sub.incident.isUnanonymized ? 'UNLOCKED' : 'SEALED & ANONYMOUS' }}
                      </span>
                    </div>

                    @if (!sub.incident.isUnanonymized) {
                      <ion-button size="small" color="danger" fill="outline" (click)="promptUnanonymize(sub)">
                        Unlock Identity
                      </ion-button>
                    }
                  </div>

                  @if (sub.incident.isUnanonymized) {
                    <div style="margin-top: 8px; font-size: 0.82rem; color: #1e293b;">
                      <div><strong>Doctor Name:</strong> {{ sub.traineeName }}</div>
                      <div><strong>Email:</strong> {{ sub.traineeEmail }}</div>
                      <div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">
                        Unlocked by: {{ sub.incident.unanonymizedBy }} on {{ sub.incident.unanonymizedAt }}
                      </div>
                    </div>
                  }
                </div>

                <!-- Incident Actions -->
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                  <div style="display: flex; gap: 6px;">
                    <button
                      type="button"
                      (click)="updateStatus(sub, 'under_investigation')"
                      style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer;"
                    >
                      Set In Investigation
                    </button>
                    <button
                      type="button"
                      (click)="updateStatus(sub, 'resolved')"
                      style="background: #e6f3eb; border: 1px solid #007f3b; color: #007f3b; border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer;"
                    >
                      Mark Resolved
                    </button>
                  </div>

                  <!-- Remove Safety Flag button -->
                  <ion-button size="small" fill="clear" color="medium" (click)="removeFlag(sub)">
                    <ion-icon name="trash-outline" slot="start"></ion-icon>
                    Remove Safety Flag
                  </ion-button>
                </div>

              </ion-card-content>
            </ion-card>
          }

          @if (flaggedSubmissions().length === 0) {
            <div style="text-align: center; padding: 40px 16px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
              <ion-icon name="shield-checkmark-outline" style="font-size: 44px; color: #007f3b;"></ion-icon>
              <h3 style="margin: 8px 0 4px; font-size: 1rem; font-weight: 700; color: #334155;">No Active Safety Escalations</h3>
              <p style="margin: 0; font-size: 0.8rem; color: #64748b;">All reported feedbacks are within normal governance thresholds.</p>
            </div>
          }
        }

        <!-- TAB 2: AUDIT LOG TRAIL -->
        @if (currentTab === 'audit') {
          <div style="background: white; border-radius: 12px; border: 1px solid #cbd5e1; padding: 16px;">
            <h3 style="margin: 0 0 12px; font-size: 0.95rem; font-weight: 700; color: #003087;">
              Clinical Governance Audit Trail
            </h3>

            @for (log of mockData.auditLogs(); track log.id) {
              <div style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 0.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-weight: 700; color: #005eb8;">{{ log.action }}</span>
                  <span style="font-size: 0.72rem; color: #64748b;">{{ log.timestamp }}</span>
                </div>
                <div style="color: #1e293b;">{{ log.details }}</div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">
                  Authorized by: <strong>{{ log.adminName }}</strong> &bull; Reason: <em>"{{ log.justification }}"</em>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </ion-content>
  `
})
export class AdminEscalationsComponent {
  readonly mockData = inject(MockDataService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  currentTab = 'queue';

  readonly flaggedSubmissions = computed(() => {
    return this.mockData.submissions().filter(s => s.incident.isFlagged);
  });

  constructor() {
    addIcons({
      alertCircleOutline, shieldCheckmarkOutline, lockClosedOutline,
      lockOpenOutline, personOutline, documentTextOutline, timeOutline,
      checkmarkCircleOutline, trashOutline
    });
  }

  getStatusTagClass(status?: IncidentStatus): string {
    if (status === 'resolved') return 'nhs-tag-green';
    if (status === 'under_investigation') return 'nhs-tag-amber';
    return 'nhs-tag-red';
  }

  updateStatus(sub: SurveySubmission, status: IncidentStatus) {
    this.mockData.updateIncidentStatus(sub.id, status);
  }

  async removeFlag(sub: SurveySubmission) {
    const alert = await this.alertCtrl.create({
      header: 'Remove Safety Flag',
      message: 'Are you sure you want to dismiss and remove the urgent safety flag for this submission?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove Flag',
          role: 'destructive',
          handler: () => {
            this.mockData.removeSafetyFlag(sub.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async promptUnanonymize(sub: SurveySubmission) {
    const alert = await this.alertCtrl.create({
      header: 'Unlock Author Identity',
      subHeader: 'Legal Governance Justification Required:',
      inputs: [
        {
          name: 'gmc',
          type: 'text',
          placeholder: 'Admin GMC / Registration Number'
        },
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Formal justification (e.g. Serious Patient Safety Incident investigation)'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Unlock & Audit Log',
          role: 'destructive',
          handler: (data) => {
            if (!data.reason || data.reason.trim() === '') return false;
            this.mockData.unanonymizeSubmission(sub.id, 'Admin', data.reason.trim());
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}
