import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonItem, IonLabel,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonCheckbox, IonButton, IonIcon, IonSegment, IonSegmentButton,
  IonRadioGroup, IonRadio, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline, trashOutline, checkmarkCircleOutline,
  rocketOutline, eyeOutline, createOutline
} from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { Survey, SurveyQuestion } from '../../../models/nhs.models';

@Component({
  selector: 'app-survey-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonItem, IonLabel,
    IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonCheckbox, IonButton, IonIcon, IonSegment, IonSegmentButton,
      ],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">
        <!-- Segment: Builder vs Live Preview -->
        <ion-segment
          [(ngModel)]="activeTab"
          style="background: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #cbd5e1;"
        >
          <ion-segment-button value="builder">
            <ion-icon name="create-outline"></ion-icon>
            <ion-label style="font-weight: 700;">Edit Survey</ion-label>
          </ion-segment-button>
          <ion-segment-button value="preview">
            <ion-icon name="eye-outline"></ion-icon>
            <ion-label style="font-weight: 700;">Live Trainee Preview</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- TAB 1: BUILDER -->
        @if (activeTab === 'builder') {
          <!-- Step 1: Survey Metadata -->
          <ion-card style="margin: 0 0 16px;">
            <ion-card-header>
              <ion-card-title style="font-size: 1.05rem; color: #003087; font-weight: 700;">
                1. Campaign Details
              </ion-card-title>
            </ion-card-header>
            <ion-card-content style="display: flex; flex-direction: column; gap: 12px;">
              <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                <ion-label position="stacked" style="color: #003087; font-weight: 600;">Survey Title *</ion-label>
                <ion-input [(ngModel)]="title" placeholder="e.g. Winter Rota Escalation & Night Rest Facilities"></ion-input>
              </ion-item>

              <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                <ion-label position="stacked" style="color: #003087; font-weight: 600;">Survey Purpose & Objective *</ion-label>
                <ion-textarea [(ngModel)]="description" rows="3" placeholder="Explain the training issues this survey will address in deanery meetings..."></ion-textarea>
              </ion-item>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <ion-label position="stacked" style="color: #003087; font-weight: 600;">Est. Time (Mins)</ion-label>
                  <ion-input type="number" [(ngModel)]="estimatedMinutes" placeholder="4"></ion-input>
                </ion-item>

                <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <ion-label position="stacked" style="color: #003087; font-weight: 600;">Closing Deadline</ion-label>
                  <ion-input type="date" [(ngModel)]="deadline"></ion-input>
                </ion-item>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Step 2: Audience Targeting -->
          <ion-card style="margin: 0 0 16px;">
            <ion-card-header>
              <ion-card-title style="font-size: 1.05rem; color: #003087; font-weight: 700;">
                2. Audience & Sector Targeting
              </ion-card-title>
            </ion-card-header>
            <ion-card-content style="display: flex; flex-direction: column; gap: 10px;">
              <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                <ion-checkbox [(ngModel)]="allSectors" justify="start">
                  <span style="font-weight: 600; color: #212b32;">Broadcast to All London Sectors</span>
                </ion-checkbox>
              </ion-item>

              @if (!allSectors) {
                <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <ion-label position="stacked" style="color: #003087; font-weight: 600;">Select Target Sectors</ion-label>
                  <ion-select [(ngModel)]="selectedSectors" multiple="true" placeholder="Choose sectors">
                    @for (sec of sectors(); track sec.id) {
                      <ion-select-option [value]="sec.id">{{ sec.name }} ({{ sec.code }})</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              }
            </ion-card-content>
          </ion-card>

          <!-- Step 3: Question Builder -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 4px 8px;">
            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #003087;">
              3. Questions ({{ questions.length }})
            </h3>
            <ion-button size="small" fill="outline" color="primary" (click)="addQuestion()">
              <ion-icon name="add-outline" slot="start"></ion-icon>
              Add Question
            </ion-button>
          </div>

          @for (q of questions; track q.id; let idx = $index) {
            <ion-card style="margin: 0 0 14px;">
              <ion-card-content style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: #003087;">Question {{ idx + 1 }}</strong>
                  <ion-button color="danger" fill="clear" size="small" (click)="removeQuestion(idx)" [disabled]="questions.length === 1">
                    <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>

                <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <ion-input [(ngModel)]="q.title" placeholder="Type question prompt here..."></ion-input>
                </ion-item>

                <ion-item lines="none" style="--background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <ion-select [(ngModel)]="q.type" interface="popover" style="width: 100%;">
                    <ion-select-option value="rating">1–5 Likert Rating Scale</ion-select-option>
                    <ion-select-option value="single_choice">Single Choice Radio</ion-select-option>
                    <ion-select-option value="multiple_choice">Multiple Choice Checkboxes</ion-select-option>
                    <ion-select-option value="text">Free-Text Narrative</ion-select-option>
                  </ion-select>
                </ion-item>

                <!-- Options Editor for Choice Questions -->
                @if (q.type === 'single_choice' || q.type === 'multiple_choice') {
                  <div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 6px;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: #003087; margin-bottom: 6px;">
                      Selectable Options:
                    </div>
                    @for (opt of q.options; track opt; let optIdx = $index) {
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span style="font-size: 0.82rem; color: #768692;">&bull;</span>
                        <input
                          type="text"
                          [(ngModel)]="q.options![optIdx]"
                          style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; font-size: 0.82rem;"
                        />
                        <ion-button fill="clear" color="danger" size="small" (click)="removeOption(q, optIdx)" [disabled]="(q.options?.length || 0) <= 2">
                          &times;
                        </ion-button>
                      </div>
                    }
                    <ion-button size="small" fill="outline" (click)="addOption(q)" style="font-size: 0.76rem; height: 28px;">
                      + Add Option
                    </ion-button>
                  </div>
                }
              </ion-card-content>
            </ion-card>
          }

          <!-- Publish Action -->
          <ion-button
            expand="block"
            color="primary"
            (click)="publishSurvey()"
            style="height: 48px; font-weight: 700; margin: 24px 0 32px;"
          >
            <ion-icon name="rocket-outline" slot="start"></ion-icon>
            Publish Survey to Trainees
          </ion-button>
        }

        <!-- TAB 2: LIVE PREVIEW -->
        @if (activeTab === 'preview') {
          <div style="background: #e6f3eb; border: 1px solid #007f3b; border-radius: 8px; padding: 10px; margin-bottom: 16px; font-size: 0.84rem; color: #007f3b; display: flex; align-items: center; gap: 6px;">
            <ion-icon name="eye-outline"></ion-icon>
            <span><strong>Live Trainee Preview:</strong> This is how junior doctors will interact with your survey.</span>
          </div>

          <ion-card style="margin: 0 0 16px; border: 2px solid #005eb8;">
            <ion-card-header>
              <span class="nhs-tag nhs-tag-blue" style="margin-bottom: 4px;">
                {{ allSectors ? 'London Wide' : 'Targeted Regional' }}
              </span>
              <ion-card-title style="font-size: 1.15rem; color: #003087; font-weight: 800;">
                {{ title || 'Untitled Survey' }}
              </ion-card-title>
              <ion-card-subtitle style="font-size: 0.82rem; color: #768692; margin-top: 2px;">
                Closes: {{ deadline }} &bull; Est. {{ estimatedMinutes }} mins
              </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <p style="font-size: 0.86rem; color: #425563; line-height: 1.4;">
                {{ description || 'No description provided.' }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Department Selector Preview -->
          <ion-card style="margin: 0 0 14px;">
            <ion-card-header style="padding-bottom: 4px;">
              <ion-card-title style="font-size: 0.95rem; color: #003087;">
                1. Placement Department <span style="color: #d5281b;">*</span>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1; font-size: 0.82rem; color: #768692;">
                [Trainee Selects Hospital Department Dropdown]
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Preview of Questions -->
          @for (q of questions; track q.id; let idx = $index) {
            <ion-card style="margin: 0 0 14px;">
              <ion-card-header style="padding-bottom: 4px;">
                <ion-card-title style="font-size: 0.95rem; color: #212b32;">
                  {{ idx + 2 }}. {{ q.title || 'Question ' + (idx + 1) }}
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                @if (q.type === 'rating') {
                  <div style="display: flex; justify-content: space-between; gap: 4px; margin-top: 6px;">
                    @for (s of [1,2,3,4,5]; track s) {
                      <ion-button fill="outline" color="primary" size="small" style="flex: 1;">{{ s }}</ion-button>
                    }
                  </div>
                }
                @if (q.type === 'single_choice' || q.type === 'multiple_choice') {
                  <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                    @for (opt of q.options; track opt) {
                      <div style="padding: 6px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.82rem;">
                        {{ q.type === 'multiple_choice' ? '☐' : '○' }} {{ opt }}
                      </div>
                    }
                  </div>
                }
                @if (q.type === 'text') {
                  <div style="padding: 16px; background: #f8fafc; border-radius: 6px; border: 1px dashed #cbd5e1; font-size: 0.82rem; color: #768692;">
                    [Free text input area]
                  </div>
                }
              </ion-card-content>
            </ion-card>
          }
        }
      </div>
    </ion-content>
  `
})
export class SurveyBuilderComponent {
  private mockData = inject(MockDataService);
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  readonly sectors = this.mockData.sectors;

  activeTab: 'builder' | 'preview' = 'builder';

  title = '';
  description = '';
  estimatedMinutes = 4;
  deadline = '2026-11-01';
  allSectors = false;
  selectedSectors: string[] = ['sec-nel'];

  questions: SurveyQuestion[] = [
    {
      id: 'q-builder-1',
      title: 'Overall satisfaction with department clinical supervision this block:',
      type: 'rating',
      required: true,
      minRating: 1,
      maxRating: 5,
      labels: { min: '1 - Very Unsatisfied', max: '5 - Highly Satisfied' }
    },
    {
      id: 'q-builder-2',
      title: 'Which rest facilities are accessible during night shifts?',
      type: 'multiple_choice',
      required: true,
      options: ['Doctor mess with beds', 'Reclining sleep chairs', 'Hot food provision', 'Secure lockers']
    },
    {
      id: 'q-builder-3',
      title: 'Additional comments regarding rest facilities, culture, or safe working:',
      type: 'text',
      required: false
    }
  ];

  constructor() {
    addIcons({
      addOutline, trashOutline, checkmarkCircleOutline,
      rocketOutline, eyeOutline, createOutline
    });
  }

  addQuestion() {
    this.questions.push({
      id: 'q-' + Date.now(),
      title: '',
      type: 'rating',
      required: true,
      minRating: 1,
      maxRating: 5,
      labels: { min: 'Poor', max: 'Excellent' },
      options: ['Option 1', 'Option 2']
    });
  }

  removeQuestion(index: number) {
    this.questions.splice(index, 1);
  }

  addOption(question: SurveyQuestion) {
    if (!question.options) question.options = [];
    question.options.push('Option ' + (question.options.length + 1));
  }

  removeOption(question: SurveyQuestion, optIdx: number) {
    if (question.options) {
      question.options.splice(optIdx, 1);
    }
  }

  async publishSurvey() {
    if (!this.title.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'Please provide a survey title.',
        color: 'danger',
        duration: 2500,
        position: 'top'
      });
      await toast.present();
      return;
    }

    const rep = this.auth.currentUser() || { id: 'usr-rep-1', name: 'Regional Rep', specialty: 'Emergency Medicine' };
    const newSurvey: Survey = {
      id: 'srv-' + Date.now(),
      title: this.title,
      description: this.description || 'Regional feedback collected for training review.',
      creatorId: rep.id,
      creatorName: rep.name + ' (' + (rep.specialty || 'Rep') + ')',
      target: {
        allSectors: this.allSectors,
        sectorIds: this.allSectors ? [] : this.selectedSectors,
        hospitalIds: []
      },
      questions: this.questions,
      estimatedMinutes: this.estimatedMinutes || 4,
      deadline: this.deadline || '2026-11-15',
      status: 'active',
      responseCount: 0,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    this.mockData.addSurvey(newSurvey);

    const toast = await this.toastCtrl.create({
      message: 'Survey published! Targeted trainees can now fill it in their Feedback hub.',
      color: 'success',
      duration: 3000,
      position: 'top'
    });
    await toast.present();

    this.router.navigate(['/tabs/rep-campaigns']);
  }
}
