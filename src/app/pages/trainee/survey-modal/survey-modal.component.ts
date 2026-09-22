import { Component, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonSelect, IonSelectOption,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonTextarea, IonRadioGroup, IonRadio, IonCheckbox, IonToggle, IonIcon,
  IonBadge, ModalController, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  closeOutline, checkmarkCircleOutline, alertCircleOutline,
  shieldCheckmarkOutline, copyOutline, ribbonOutline
} from 'ionicons/icons';
import { Survey, SurveySubmission, SurveyAnswer } from '../../../models/nhs.models';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-survey-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonSelect, IonSelectOption,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonTextarea, IonRadioGroup, IonRadio, IonCheckbox, IonToggle, IonIcon,
    IonBadge
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ isSubmittedSuccess ? 'Submission Confirmed' : survey.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      @if (isSubmittedSuccess) {
        <!-- SUCCESS ACKNOWLEDGEMENT / ARCP CERTIFICATE SCREEN -->
        <div class="app-container" style="text-align: center; padding: 24px 8px;">
          <div style="background: white; border-radius: 16px; padding: 24px 16px; border: 2px solid #007f3b; box-shadow: 0 4px 16px rgba(0,127,59,0.12);">
            <ion-icon name="checkmark-circle-outline" style="font-size: 64px; color: #007f3b; margin-bottom: 8px;"></ion-icon>

            <h2 style="margin: 0; color: #007f3b; font-size: 1.4rem; font-weight: 800;">
              Feedback Recorded!
            </h2>
            <p style="margin: 6px 0 16px; font-size: 0.88rem; color: #425563;">
              Thank you for contributing to London training quality and safe doctor working conditions.
            </p>

            <div style="background: #f0fdf4; border: 1px dashed #86efac; border-radius: 10px; padding: 14px; margin-bottom: 16px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #166534; font-size: 0.85rem; margin-bottom: 6px;">
                <ion-icon name="ribbon-outline"></ion-icon>
                <span>ARCP & e-Portfolio Evidence Receipt</span>
              </div>
              <div style="font-size: 0.82rem; color: #212b32; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>Receipt Ref:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 700;">{{ generatedReceiptRef }}</code></div>
                <div><strong>Placement:</strong> {{ submittedPlacementInfo }}</div>
                <div><strong>Date Submitted:</strong> {{ submittedTimestamp }}</div>
                <div><strong>Anonymity:</strong> Sealed & Anonymized</div>
              </div>
            </div>

            <ion-button expand="block" color="primary" (click)="dismiss()" style="font-weight: 700;">
              Return to Feedback Hub
            </ion-button>
          </div>
        </div>
      } @else {
        <!-- FORM RENDERER -->
        <div class="app-container">
          <!-- Anonymity Banner -->
          <div style="background: #e6f3eb; border: 1px solid #007f3b; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; display: flex; gap: 10px; align-items: flex-start;">
            <ion-icon name="shield-checkmark-outline" style="color: #007f3b; font-size: 22px; flex-shrink: 0;"></ion-icon>
            <div>
              <strong style="color: #007f3b; font-size: 0.88rem;">Doctor Confidentiality Guaranteed</strong>
              <p style="margin: 2px 0 0; font-size: 0.8rem; color: #212b32;">
                Your responses are anonymous to Regional Representatives. Only aggregated metrics are shared.
              </p>
            </div>
          </div>

          <!-- Step 1: Mandatory Placement Department Selector -->
          <ion-card style="margin: 0 0 16px;">
            <ion-card-header style="padding-bottom: 6px;">
              <ion-card-title style="font-size: 1rem; color: #003087; font-weight: 700;">
                1. Placement Department <span style="color: #d5281b;">*</span>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p style="font-size: 0.82rem; color: #768692; margin-bottom: 8px;">
                Select the clinical department this feedback applies to:
              </p>
              <ion-item lines="none" style="--background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1;">
                <ion-select [(ngModel)]="selectedDepartment" placeholder="Select your department" interface="action-sheet">
                  @for (dept of departments(); track dept.id) {
                    <ion-select-option [value]="dept.name">{{ dept.name }}</ion-select-option>
                  }
                </ion-select>
              </ion-item>
            </ion-card-content>
          </ion-card>

          <!-- Dynamic Questions Loop -->
          @for (q of survey.questions; track q.id; let idx = $index) {
            <ion-card style="margin: 0 0 16px;">
              <ion-card-header style="padding-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                  <ion-card-title style="font-size: 0.96rem; color: #212b32; font-weight: 700;">
                    {{ idx + 2 }}. {{ q.title }}
                  </ion-card-title>
                  @if (q.required) {
                    <ion-badge color="danger" style="font-size: 0.68rem;">Required</ion-badge>
                  }
                </div>
                @if (q.description) {
                  <p style="font-size: 0.8rem; color: #768692; margin: 4px 0 0;">{{ q.description }}</p>
                }
              </ion-card-header>

              <ion-card-content>
                <!-- Rating Scale -->
                @if (q.type === 'rating') {
                  <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #768692;">
                      <span>{{ q.labels?.min || '1 - Poor' }}</span>
                      <span>{{ q.labels?.max || '5 - Excellent' }}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 6px;">
                      @for (score of [1, 2, 3, 4, 5]; track score) {
                        <ion-button
                          [color]="answers[q.id] === score ? 'primary' : 'light'"
                          (click)="answers[q.id] = score"
                          style="flex: 1; font-weight: 700; height: 44px;"
                        >
                          {{ score }}
                        </ion-button>
                      }
                    </div>
                  </div>
                }

                <!-- Single Choice Radio -->
                @if (q.type === 'single_choice') {
                  <ion-radio-group [(ngModel)]="answers[q.id]" style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
                    @for (opt of q.options; track opt) {
                      <ion-item lines="none" style="--background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 4px;">
                        <ion-radio [value]="opt" justify="start" labelPlacement="end">
                          <span style="font-size: 0.86rem; color: #212b32;">{{ opt }}</span>
                        </ion-radio>
                      </ion-item>
                    }
                  </ion-radio-group>
                }

                <!-- Multiple Choice Checkboxes -->
                @if (q.type === 'multiple_choice') {
                  <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
                    @for (opt of q.options; track opt) {
                      <ion-item lines="none" style="--background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 4px;">
                        <ion-checkbox
                          [checked]="isOptionChecked(q.id, opt)"
                          (ionChange)="toggleOptionCheckbox(q.id, opt)"
                          justify="start"
                        >
                          <span style="font-size: 0.86rem; color: #212b32;">{{ opt }}</span>
                        </ion-checkbox>
                      </ion-item>
                    }
                  </div>
                }

                <!-- Free Text Comment -->
                @if (q.type === 'text') {
                  <ion-textarea
                    [(ngModel)]="answers[q.id]"
                    placeholder="Share your detailed experience or comments here..."
                    rows="4"
                    style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; margin-top: 6px;"
                  ></ion-textarea>
                }
              </ion-card-content>
            </ion-card>
          }

          <!-- Serious Incident Escalation Section -->
          <ion-card style="margin: 0 0 24px; border: 1px solid #d5281b; background: #fff;">
            <ion-card-header style="background: #fbeae8; border-bottom: 1px solid #f2c7c3; padding: 12px 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon name="alert-circle-outline" style="color: #d5281b; font-size: 22px;"></ion-icon>
                  <strong style="color: #d5281b; font-size: 0.92rem;">Serious Incident / Safety Escalation</strong>
                </div>
                <ion-toggle color="danger" [(ngModel)]="flagSeriousIncident"></ion-toggle>
              </div>
            </ion-card-header>

            @if (flagSeriousIncident) {
              <ion-card-content style="padding-top: 14px;">
                <div style="background: #fff8f7; border-left: 3px solid #d5281b; padding: 10px; margin-bottom: 12px; font-size: 0.82rem; color: #661007;">
                  <strong>Safeguarding & Governance Notice:</strong>
                  Flagging this submission alerts the <strong>Higher Deanery Administrator</strong>. If required for patient safety, GMC investigation, or trainee protection, the Higher Admin holds authority to un-anonymize trainee details to provide formal follow-up.
                </div>
                <ion-textarea
                  [(ngModel)]="incidentSummary"
                  placeholder="Describe the safety concern, rota breach, or clinical governance issue in detail..."
                  rows="3"
                  style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px;"
                ></ion-textarea>
              </ion-card-content>
            }
          </ion-card>

          <!-- Submit Button -->
          <ion-button
            expand="block"
            color="primary"
            (click)="submitForm()"
            style="height: 48px; font-weight: 700; margin-bottom: 32px;"
          >
            <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
            Submit Feedback
          </ion-button>
        </div>
      }
    </ion-content>
  `
})
export class SurveyModalComponent {
  @Input() survey!: Survey;

  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private mockData = inject(MockDataService);
  private auth = inject(AuthService);

  readonly departments = this.mockData.departments;

  selectedDepartment = '';
  answers: Record<string, any> = {};
  flagSeriousIncident = false;
  incidentSummary = '';

  isSubmittedSuccess = false;
  generatedReceiptRef = '';
  submittedPlacementInfo = '';
  submittedTimestamp = '';

  constructor() {
    addIcons({
      closeOutline, checkmarkCircleOutline, alertCircleOutline,
      shieldCheckmarkOutline, copyOutline, ribbonOutline
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  isOptionChecked(questionId: string, option: string): boolean {
    const list = this.answers[questionId] as string[] | undefined;
    return list ? list.includes(option) : false;
  }

  toggleOptionCheckbox(questionId: string, option: string) {
    let list = (this.answers[questionId] as string[] | undefined) || [];
    if (list.includes(option)) {
      list = list.filter((o) => o !== option);
    } else {
      list = [...list, option];
    }
    this.answers[questionId] = list;
  }

  async submitForm() {
    if (!this.selectedDepartment) {
      const toast = await this.toastCtrl.create({
        message: 'Please select your department before submitting.',
        color: 'danger',
        duration: 2500,
        position: 'top'
      });
      await toast.present();
      return;
    }

    const trainee = this.auth.currentUser() || { id: 'usr-trainee-1', name: 'Trainee', email: 'trainee@nhs.net', sectorId: 'sec-nel', hospitalId: 'hosp-rlh', grade: 'ST3' };
    const formattedAnswers: SurveyAnswer[] = Object.keys(this.answers).map((qId) => ({
      questionId: qId,
      value: this.answers[qId]
    }));

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.generatedReceiptRef = `NHS-NEL-${Date.now().toString().slice(-6)}`;
    this.submittedPlacementInfo = `The Royal London Hospital • ${this.selectedDepartment} (${trainee.grade || 'ST3'})`;
    this.submittedTimestamp = now;

    const submission: SurveySubmission = {
      id: 'sub-' + Date.now(),
      surveyId: this.survey.id,
      surveyTitle: this.survey.title,
      traineeId: trainee.id,
      traineeName: trainee.name,
      traineeEmail: trainee.email,
      sectorId: trainee.sectorId || 'sec-nel',
      hospitalId: trainee.hospitalId || 'hosp-rlh',
      hospitalName: 'The Royal London Hospital',
      departmentName: this.selectedDepartment,
      grade: trainee.grade || 'ST3',
      submittedAt: now,
      answers: formattedAnswers,
      incident: {
        isFlagged: this.flagSeriousIncident,
        concernSummary: this.incidentSummary || undefined,
        status: this.flagSeriousIncident ? 'pending_review' : undefined,
        isUnanonymized: false
      }
    };

    this.mockData.addSubmission(submission);
    this.isSubmittedSuccess = true;
  }
}
