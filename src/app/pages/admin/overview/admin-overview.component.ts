import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonIcon, IonButton,
  AlertController, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  businessOutline, addCircleOutline, trashOutline,
  gitNetworkOutline, locationOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { Hospital, Trust } from '../../../models/nhs.models';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBadge, IonIcon, IonButton
  ],
  styles: [`
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 16px;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 12px;
      border: 1px solid #cbd5e1;
      text-align: center;
    }

    .stat-num {
      font-size: 1.5rem;
      font-weight: 800;
      color: #005eb8;
    }

    .stat-lbl {
      font-size: 0.72rem;
      color: #768692;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 2px;
    }

    .trust-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }

    .hosp-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      margin: 3px 4px 3px 0;
      color: #1e293b;
    }
  `],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">

        <!-- Top Header & Management Action -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
          <div>
            <h1 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #003087;">
              Regional Hierarchy & Hospital Directory
            </h1>
            <p style="margin: 2px 0 0; font-size: 0.8rem; color: #475569;">
              Management of London Sectors, Healthcare Trusts, and Hospitals.
            </p>
          </div>

          <div style="display: flex; gap: 8px;">
            <ion-button size="small" color="primary" (click)="openAddHospitalAlert()">
              <ion-icon name="add-circle-outline" slot="start"></ion-icon>
              Add Hospital
            </ion-button>
          </div>
        </div>

        <!-- Overview Stats -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-num">{{ sectors().length }}</div>
            <div class="stat-lbl">Sectors</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #007f3b;">{{ trusts().length }}</div>
            <div class="stat-lbl">Trusts</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #003087;">{{ hospitals().length }}</div>
            <div class="stat-lbl">Active Hospitals</div>
          </div>
        </div>

        <!-- Sectors & Trusts Explorer -->
        @for (sec of sectors(); track sec.id) {
          <ion-card style="margin: 0 0 16px;">
            <ion-card-header style="padding-bottom: 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <ion-card-title style="font-size: 1rem; color: #003087; font-weight: 800;">
                  {{ sec.name }} ({{ sec.code }})
                </ion-card-title>
                <ion-badge color="primary">{{ getTrustsForSector(sec.id).length }} Trusts</ion-badge>
              </div>
            </ion-card-header>

            <ion-card-content style="padding: 12px 14px;">
              @for (trust of getTrustsForSector(sec.id); track trust.id) {
                <div class="trust-item">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 700; color: #005eb8; font-size: 0.86rem;">
                      {{ trust.name }} ({{ trust.code }})
                    </div>
                  </div>

                  <!-- Hospitals in this Trust -->
                  <div style="margin-top: 6px;">
                    @for (hosp of getHospitalsForTrust(trust.id); track hosp.id) {
                      <span class="hosp-chip">
                        <ion-icon name="business-outline" style="font-size: 12px; color: #005eb8;"></ion-icon>
                        <span>{{ hosp.name }}</span>
                        <button
                          type="button"
                          (click)="removeHospital(hosp)"
                          style="background: transparent; border: none; color: #94a3b8; margin-left: 2px; cursor: pointer; display: flex; align-items: center; padding: 0;"
                          title="Remove hospital"
                        >
                          &times;
                        </button>
                      </span>
                    }
                    @if (getHospitalsForTrust(trust.id).length === 0) {
                      <span style="font-size: 0.75rem; color: #94a3b8; font-style: italic;">
                        No hospitals registered in this trust.
                      </span>
                    }
                  </div>
                </div>
              }
            </ion-card-content>
          </ion-card>
        }

      </div>
    </ion-content>
  `
})
export class AdminOverviewComponent {
  private mockData = inject(MockDataService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly sectors = this.mockData.sectors;
  readonly trusts = this.mockData.trusts;
  readonly hospitals = this.mockData.hospitals;

  constructor() {
    addIcons({
      businessOutline, addCircleOutline, trashOutline,
      gitNetworkOutline, locationOutline, checkmarkCircleOutline
    });
  }

  getTrustsForSector(sectorId: string) {
    return this.trusts().filter((t) => t.sectorId === sectorId);
  }

  getHospitalsForTrust(trustId: string): Hospital[] {
    return this.hospitals().filter((h) => h.trustId === trustId);
  }

  async openAddHospitalAlert() {
    const trustOptions = this.trusts().map(t => ({
      name: 'trustId',
      type: 'radio' as const,
      label: `${t.name} (${t.code})`,
      value: t.id
    }));

    const alert = await this.alertCtrl.create({
      header: 'Add New Hospital',
      subHeader: 'Enter hospital name and select associated Trust:',
      inputs: [
        {
          name: 'hospitalName',
          type: 'text',
          placeholder: 'Hospital Name (e.g. Whipps Cross Hospital)'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next: Select Trust',
          handler: async (data) => {
            if (!data.hospitalName || data.hospitalName.trim() === '') return false;
            await this.selectTrustForHospital(data.hospitalName.trim());
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async selectTrustForHospital(hospitalName: string) {
    const trustAlert = await this.alertCtrl.create({
      header: 'Select Trust',
      subHeader: `Assign "${hospitalName}" to:`,
      inputs: this.trusts().map((t, idx) => ({
        name: 'trustId',
        type: 'radio' as const,
        label: `${t.name} (${t.code})`,
        value: t.id,
        checked: idx === 0
      })),
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save Hospital',
          handler: (trustId) => {
            const trust = this.trusts().find(t => t.id === trustId);
            if (!trust) return;
            const newHospital: Hospital = {
              id: `hosp-${Date.now()}`,
              name: hospitalName,
              trustId: trust.id,
              sectorId: trust.sectorId
            };
            this.mockData.addHospital(newHospital);
            this.showToast(`Added "${hospitalName}" to ${trust.name}`);
          }
        }
      ]
    });

    await trustAlert.present();
  }

  async removeHospital(hosp: Hospital) {
    const alert = await this.alertCtrl.create({
      header: 'Remove Hospital',
      message: `Are you sure you want to remove "${hosp.name}" from directory?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.mockData.removeHospital(hosp.id);
            this.showToast(`Removed "${hosp.name}"`);
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color: 'dark'
    });
    await toast.present();
  }
}
