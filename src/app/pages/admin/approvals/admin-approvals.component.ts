import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, medkitOutline } from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonButton, IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Regional Rep Approvals</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">
        <p style="font-size: 0.88rem; color: #768692; margin: 4px 8px 16px;">
          As Higher Admin, review and approve doctor applications requesting Regional Trainee Representative authority.
        </p>

        @for (req of repRequests(); track req.id) {
          <ion-card style="margin: 0 0 14px;">
            <ion-card-header style="padding-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                @if (req.status === 'pending') {
                  <span class="nhs-tag nhs-tag-amber">Pending Approval</span>
                }
                @if (req.status === 'approved') {
                  <span class="nhs-tag nhs-tag-green">Approved Rep</span>
                }
                @if (req.status === 'rejected') {
                  <span class="nhs-tag nhs-tag-red">Declined</span>
                }
                <span style="font-size: 0.78rem; color: #768692;">{{ req.submittedAt }}</span>
              </div>
              <ion-card-title style="font-size: 1.05rem; color: #212b32;">
                {{ req.name }}
              </ion-card-title>
              <ion-card-subtitle style="font-size: 0.82rem; color: #005eb8; margin-top: 2px;">
                {{ req.trainingGrade }} &bull; {{ req.currentHospital }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <div style="font-size: 0.85rem; color: #425563; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>GMC Number:</strong> {{ req.gmcNumber }}</div>
                <div><strong>Email:</strong> {{ req.email }}</div>
                <div><strong>Requested Sectors:</strong> {{ req.requestedSectors.join(', ') }}</div>
              </div>

              @if (req.status === 'pending') {
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                  <ion-button fill="outline" color="danger" size="small" (click)="reject(req.id)">
                    <ion-icon name="close-outline" slot="start"></ion-icon>
                    Decline
                  </ion-button>
                  <ion-button color="success" size="small" (click)="approve(req.id)">
                    <ion-icon name="checkmark-outline" slot="start"></ion-icon>
                    Approve Rep Role
                  </ion-button>
                </div>
              }
            </ion-card-content>
          </ion-card>
        }
      </div>
    </ion-content>
  `
})
export class AdminApprovalsComponent {
  private mockData = inject(MockDataService);
  private toastCtrl = inject(ToastController);

  readonly repRequests = this.mockData.repApprovals;

  constructor() {
    addIcons({ checkmarkOutline, closeOutline, medkitOutline });
  }

  async approve(id: string) {
    this.mockData.approveRep(id);
    const toast = await this.toastCtrl.create({
      message: 'Representative credentials approved. Permissions granted.',
      color: 'success',
      duration: 2500,
      position: 'top'
    });
    await toast.present();
  }

  async reject(id: string) {
    this.mockData.rejectRep(id);
    const toast = await this.toastCtrl.create({
      message: 'Representative request rejected.',
      color: 'danger',
      duration: 2500,
      position: 'top'
    });
    await toast.present();
  }
}
