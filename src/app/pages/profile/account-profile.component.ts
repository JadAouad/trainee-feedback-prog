import { GamePromptModalComponent } from '../../game/game-prompt-modal.component';
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonButton, IonIcon,
  AlertController, ToastController, ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, refreshOutline, shieldCheckmarkOutline,
  logOutOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonButton, IonIcon
  ],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">

        <!-- User Information Card -->
        <ion-card style="margin: 0 0 16px;">
          <ion-card-header style="text-align: center; padding-bottom: 8px;">
            <ion-icon name="person-circle-outline" style="font-size: 64px; color: #005eb8;"></ion-icon>
            <ion-card-title style="font-size: 1.25rem; color: #212b32; font-weight: 700;">
              {{ user()?.name }}
            </ion-card-title>
            <ion-card-subtitle style="font-size: 0.85rem; color: #768692;">
              {{ user()?.email }}
            </ion-card-subtitle>
            <div style="margin-top: 8px;">
              <span
                class="nhs-tag nhs-tag-blue"
                (click)="openGameModal()"
                style="cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; display: inline-flex; align-items: center; gap: 4px;"
                title="Click here"
              >
                <span>Active Role: {{ user()?.role | uppercase }}</span>
              </span>
            </div>
          </ion-card-header>

          <ion-card-content style="border-top: 1px solid #e8edee; padding-top: 12px;">
            <div style="font-size: 0.86rem; color: #425563; display: flex; flex-direction: column; gap: 8px;">
              <div><strong>Grade / Title:</strong> {{ user()?.grade || 'N/A' }}</div>
              <div><strong>Specialty / Program:</strong> {{ user()?.specialty || 'N/A' }}</div>
              @if (user()?.role === 'trainee') {
                <div><strong>Placement Hospital:</strong> The Royal London Hospital</div>
                <div><strong>Trust:</strong> Barts Health Trust</div>
                <div><strong>Sector:</strong> North East London (NEL)</div>
              }
              @if (user()?.role === 'rep') {
                <div><strong>Assigned Sectors:</strong> North East London (NEL), North Central London (NCL)</div>
                <div><strong>Accreditation:</strong> Regional Trainee Representative Approved</div>
              }
              @if (user()?.role === 'admin') {
                <div><strong>Authority:</strong> London Deanery Clinical Governance Lead</div>
              }
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Sign Out Action Card -->
        <ion-card style="margin: 0 0 16px; border: 1px solid #d5281b;">
          <ion-card-content style="padding: 16px;">
            <h3 style="margin: 0 0 4px; font-size: 1rem; font-weight: 700; color: #d5281b;">
              Account Session
            </h3>
            <p style="margin: 0 0 14px; font-size: 0.82rem; color: #64748b;">
              Signed in as <strong>{{ user()?.name }}</strong> ({{ user()?.email }}).
            </p>
            <ion-button expand="block" color="danger" (click)="confirmSignOut()">
              <ion-icon name="log-out-outline" slot="start"></ion-icon>
              Sign Out
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Demo Data Reset Card -->
        <ion-card style="margin: 0 0 16px; border: 1px solid #cbd5e1;">
          <ion-card-content style="padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem; color: #334155;">Reset Demo Data</div>
                <div style="font-size: 0.75rem; color: #64748b;">Restore surveys, submissions, and hospital directories</div>
              </div>
              <ion-button size="small" fill="outline" color="medium" (click)="resetData()">
                <ion-icon name="refresh-outline" slot="start"></ion-icon>
                Reset
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

      </div>
    </ion-content>
  `
})
export class AccountProfileComponent {
  private auth = inject(AuthService);
  private mockData = inject(MockDataService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);

  async openGameModal() {
    const modal = await this.modalCtrl.create({
      component: GamePromptModalComponent,
      cssClass: 'game-prompt-modal-sheet', backdropDismiss: true,
    });
    await modal.present();
  }

  readonly user = this.auth.currentUser;

  constructor() {
    addIcons({
      personCircleOutline, refreshOutline, shieldCheckmarkOutline,
      logOutOutline, checkmarkCircleOutline
    });
  }

  async confirmSignOut() {
    const alert = await this.alertCtrl.create({
      header: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Sign Out',
          role: 'destructive',
          handler: () => {
            this.auth.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  async resetData() {
    this.mockData.resetDemoData();
    const toast = await this.toastCtrl.create({
      message: 'Demo data restored to initial state.',
      color: 'dark',
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}
