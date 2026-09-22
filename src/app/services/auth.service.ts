import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile, UserRole } from '../models/nhs.models';

const STORAGE_KEY_AUTH = 'nhs_auth_user_v1';

export interface AuthAccount extends UserProfile {
  username: string;
  passwordHash: string; // mock password
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  readonly accounts: AuthAccount[] = [
    {
      id: 'usr-trainee-1',
      username: 'trainee',
      passwordHash: 'trainee1',
      name: 'Trainee',
      email: 'trainee@nhs.net',
      role: 'trainee',
      sectorId: 'sec-nel',
      trustId: 'trust-barts',
      hospitalId: 'hosp-rlh',
      grade: 'ST3',
      specialty: 'Paediatrics & Neonatology',
    },
    {
      id: 'usr-rep-1',
      username: 'rep',
      passwordHash: 'rep1',
      name: 'Regional Rep',
      email: 'rep.london@nhs.net',
      role: 'rep',
      assignedSectors: ['sec-nel', 'sec-ncl'],
      repApproved: true,
      grade: 'ST6',
      specialty: 'Emergency Medicine',
    },
    {
      id: 'usr-admin-1',
      username: 'admin',
      passwordHash: 'admin1',
      name: 'Admin',
      email: 'admin.deanery@nhs.net',
      role: 'admin',
      grade: 'Lead',
      specialty: 'London Deanery Quality & Governance',
    },
  ];

  readonly currentUser = signal<UserProfile | null>(this.loadStoredUser());

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly currentRole = computed<UserRole | null>(() => this.currentUser()?.role || null);
  readonly isTrainee = computed(() => this.currentRole() === 'trainee');
  readonly isRep = computed(() => this.currentRole() === 'rep');
  readonly isAdmin = computed(() => this.currentRole() === 'admin');

  readonly canManageSurveys = computed(() => this.isRep() || this.isAdmin());
  readonly canViewAnalytics = computed(() => this.isRep() || this.isAdmin());

  private loadStoredUser(): UserProfile | null {
    const stored = localStorage.getItem(STORAGE_KEY_AUTH);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    // Default to trainee if not logged in yet for first run, or null
    return this.accounts[0];
  }

  login(username: string, password: string): { success: boolean; message?: string } {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const match = this.accounts.find(
      a => a.username.toLowerCase() === cleanUser && a.passwordHash === cleanPass
    );

    if (match) {
      const profile: UserProfile = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        sectorId: match.sectorId,
        trustId: match.trustId,
        hospitalId: match.hospitalId,
        grade: match.grade,
        specialty: match.specialty,
        assignedSectors: match.assignedSectors,
        repApproved: match.repApproved,
      };

      this.currentUser.set(profile);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(profile));
      return { success: true };
    }

    return { success: false, message: 'Invalid username or password. Please check your credentials.' };
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    this.router.navigate(['/login']);
  }
}
