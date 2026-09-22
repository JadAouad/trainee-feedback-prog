import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline, personOutline, chatbubblesOutline, logInOutline,
  shieldCheckmarkOutline, alertCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonButton, IonIcon
  ],
  styles: [`
    .login-container {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 24px 16px;
      max-width: 440px;
      margin: 0 auto;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .nhs-logo-box {
      background: #005eb8;
      color: white;
      font-weight: 900;
      font-size: 2rem;
      padding: 6px 18px;
      border-radius: 6px;
      display: inline-block;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(0, 94, 184, 0.25);
    }

    .login-card {
      width: 100%;
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 6px 20px rgba(0, 48, 135, 0.08);
      margin: 0 0 16px;
    }

    .input-field {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.9rem;
      color: #1e293b;
      margin-top: 4px;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-field:focus {
      border-color: #005eb8;
      background: #ffffff;
    }

    .quick-pill {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #003087;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }

    .quick-pill:hover {
      background: #e0f2fe;
      border-color: #005eb8;
    }
  `],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="login-container">

        <!-- Brand Header (No NHS branding) -->
        <div class="brand-header">
          <div style="background: #005eb8; color: white; width: 56px; height: 56px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 12px rgba(0, 94, 184, 0.25);">
            <ion-icon name="chatbubbles-outline"></ion-icon>
          </div>
          <h1 style="margin: 12px 0 2px; font-size: 1.4rem; font-weight: 800; color: #003087;">
            Trainee Feedback Platform
          </h1>
          <p style="margin: 0; font-size: 0.85rem; color: #475569;">
            London Regional Postgraduate Medical Training
          </p>
        </div>

        <!-- Login Form Card -->
        <div class="login-card">
          <div style="padding: 20px 20px 10px;">
            <h2 style="margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; color: #1e293b;">
              Sign In to Your Account
            </h2>
            <p style="margin: 0; font-size: 0.8rem; color: #64748b;">
              Access role-governed surveys, analytics, or trainee feedback.
            </p>
          </div>

          <div style="padding: 0 20px 24px;">
            <!-- Error Alert -->
            @if (errorMessage()) {
              <div style="background: #fbeae8; border-left: 4px solid #d5281b; padding: 10px 12px; border-radius: 6px; font-size: 0.82rem; color: #661007; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
                <ion-icon name="alert-circle-outline" style="font-size: 18px; flex-shrink: 0;"></ion-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form (ngSubmit)="onSubmit()">
              <!-- Username -->
              <div style="margin-bottom: 14px;">
                <label style="font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase;">
                  Username
                </label>
                <input
                  type="text"
                  class="input-field"
                  [(ngModel)]="username"
                  name="username"
                  placeholder="Enter your username"
                  autocomplete="username"
                  required
                />
              </div>

              <!-- Password -->
              <div style="margin-bottom: 20px;">
                <label style="font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase;">
                  Password
                </label>
                <input
                  type="password"
                  class="input-field"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
              </div>

              <!-- Submit Button -->
              <ion-button expand="block" type="submit" color="primary" [disabled]="loading()">
                <ion-icon name="log-in-outline" slot="start"></ion-icon>
                {{ loading() ? 'Signing In...' : 'Sign In' }}
              </ion-button>
            </form>
          </div>
        </div>

        <!-- Security & Compliance Footer -->
        <div style="text-align: center; font-size: 0.72rem; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 4px;">
          <ion-icon name="shield-checkmark-outline" style="color: #007f3b;"></ion-icon>
          <span>Clinical Governance & Protected Authentication</span>
        </div>

      </div>
    </ion-content>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  username = '';
  password = '';
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);

  constructor() {
    addIcons({
      lockClosedOutline, personOutline, chatbubblesOutline, logInOutline,
      shieldCheckmarkOutline, alertCircleOutline
    });
  }



  async onSubmit() {
    this.errorMessage.set('');

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Please enter both username and password.');
      return;
    }

    this.loading.set(true);

    const result = this.auth.login(this.username, this.password);
    this.loading.set(false);

    if (result.success) {
      const toast = await this.toastCtrl.create({
        message: `Welcome back, ${this.auth.currentUser()?.name}!`,
        color: 'success',
        duration: 2500,
        position: 'top',
      });
      await toast.present();

      // Redirect according to role
      const role = this.auth.currentRole();
      if (role === 'trainee') {
        this.router.navigate(['/tabs/feedback']);
      } else {
        this.router.navigate(['/tabs/rep-campaigns']);
      }
    } else {
      this.errorMessage.set(result.message || 'Login failed.');
    }
  }
}
