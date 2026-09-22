import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonIcon,
  IonTabs, IonTabBar, IonTabButton, IonLabel
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chatbubblesOutline, personCircleOutline,
  layersOutline, addCircleOutline, barChartOutline,
  shieldCheckmarkOutline, alertCircleOutline, businessOutline,
  personOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonIcon,
    IonTabs, IonTabBar, IonTabButton, IonLabel
  ],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #f0f4f5;
    }

    ion-header {
      flex: 0 0 56px;
      height: 56px;
      z-index: 1000;
    }

    ion-tabs {
      position: relative;
      flex: 1 1 auto;
      height: calc(100vh - 56px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    ion-tab-bar {
      flex: 0 0 56px;
      height: 56px;
      --background: #ffffff;
      background: #ffffff;
      border-top: 2px solid #005eb8;
      box-shadow: 0 -2px 10px rgba(0, 48, 135, 0.08);
      z-index: 999;
    }

    ion-tab-button {
      --color: #4c6272;
      --color-selected: #005eb8;
      font-weight: 500;
      font-size: 0.72rem;
    }

    ion-tab-button.tab-selected {
      font-weight: 700;
    }

    .user-role-badge {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.45);
      color: #ffffff;
      border-radius: 16px;
      padding: 3px 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .role-indicator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #00e676;
    }

    .role-indicator-dot.rep { background: #00d2ff; }
    .role-indicator-dot.admin { background: #ffb81c; }

    .profile-top-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s ease;
      outline: none;
    }

    .profile-top-btn:hover, .profile-top-btn:active {
      background: rgba(255, 255, 255, 0.35);
      transform: scale(1.05);
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar color="primary" style="--min-height: 56px; height: 56px;">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 8px;">
          <!-- App Logo & Title -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(255, 255, 255, 0.2); color: white; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid rgba(255, 255, 255, 0.4);">
              <ion-icon name="chatbubbles-outline"></ion-icon>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 700; font-size: 0.95rem; line-height: 1.1; color: white;">
                Trainee Feedback
              </span>
              <span style="font-size: 0.7rem; opacity: 0.85; color: white;">
                London Regional Program
              </span>
            </div>
          </div>

          <!-- Top-Right: User Role Badge + Direct Profile Button -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="user-role-badge">
              <span class="role-indicator-dot" [class]="auth.currentRole()"></span>
              <span>{{ roleLabel() }}</span>
            </div>

            <button
              type="button"
              class="profile-top-btn"
              (click)="goToProfile()"
              title="View Profile & Sign Out"
            >
              <ion-icon name="person-outline"></ion-icon>
            </button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <!-- TRAINEE TABS -->
        @if (auth.isTrainee()) {
          <ion-tab-button tab="feedback" href="/tabs/feedback">
            <ion-icon name="chatbubbles-outline"></ion-icon>
            <ion-label>Feedback</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" href="/tabs/profile">
            <ion-icon name="person-circle-outline"></ion-icon>
            <ion-label>Profile</ion-label>
          </ion-tab-button>
        }

        <!-- REGIONAL REP TABS -->
        @if (auth.isRep()) {
          <ion-tab-button tab="rep-campaigns" href="/tabs/rep-campaigns">
            <ion-icon name="layers-outline"></ion-icon>
            <ion-label>Surveys</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="rep-builder" href="/tabs/rep-builder">
            <ion-icon name="add-circle-outline"></ion-icon>
            <ion-label>New Survey</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="rep-responses" href="/tabs/rep-responses">
            <ion-icon name="bar-chart-outline"></ion-icon>
            <ion-label>Analytics</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" href="/tabs/profile">
            <ion-icon name="person-circle-outline"></ion-icon>
            <ion-label>Profile</ion-label>
          </ion-tab-button>
        }

        <!-- ADMIN TABS -->
        @if (auth.isAdmin()) {
          <ion-tab-button tab="rep-campaigns" href="/tabs/rep-campaigns">
            <ion-icon name="layers-outline"></ion-icon>
            <ion-label>Surveys</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="rep-responses" href="/tabs/rep-responses">
            <ion-icon name="bar-chart-outline"></ion-icon>
            <ion-label>Analytics</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="admin-approvals" href="/tabs/admin-approvals">
            <ion-icon name="shield-checkmark-outline"></ion-icon>
            <ion-label>Approvals</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="admin-escalations" href="/tabs/admin-escalations">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <ion-label>Escalations</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="admin-overview" href="/tabs/admin-overview">
            <ion-icon name="business-outline"></ion-icon>
            <ion-label>Regions</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" href="/tabs/profile">
            <ion-icon name="person-circle-outline"></ion-icon>
            <ion-label>Profile</ion-label>
          </ion-tab-button>
        }
      </ion-tab-bar>
    </ion-tabs>
  `
})
export class TabsPage {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  readonly roleLabel = computed(() => {
    const role = this.auth.currentRole();
    if (role === 'trainee') return 'Trainee';
    if (role === 'rep') return 'Regional Rep';
    if (role === 'admin') return 'Admin';
    return 'Signed In';
  });

  constructor() {
    addIcons({
      chatbubblesOutline, personCircleOutline,
      layersOutline, addCircleOutline, barChartOutline,
      shieldCheckmarkOutline, alertCircleOutline, businessOutline,
      personOutline
    });
  }

  goToProfile() {
    this.router.navigate(['/tabs/profile']);
  }
}
