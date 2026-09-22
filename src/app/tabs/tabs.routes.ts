import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { roleGuard, authGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      // Trainee exclusive route
      {
        path: 'feedback',
        canActivate: [roleGuard(['trainee'])],
        loadComponent: () => import('../pages/trainee/feedback/trainee-feedback.component').then((m) => m.TraineeFeedbackComponent),
      },
      // Regional Rep & Admin shared routes
      {
        path: 'rep-campaigns',
        canActivate: [roleGuard(['rep', 'admin'])],
        loadComponent: () => import('../pages/rep/campaigns/rep-campaigns.component').then((m) => m.RepCampaignsComponent),
      },
      {
        path: 'rep-builder',
        canActivate: [roleGuard(['rep', 'admin'])],
        loadComponent: () => import('../pages/rep/survey-builder/survey-builder.component').then((m) => m.SurveyBuilderComponent),
      },
      {
        path: 'rep-responses',
        canActivate: [roleGuard(['rep', 'admin'])],
        loadComponent: () => import('../pages/rep/responses/rep-responses.component').then((m) => m.RepResponsesComponent),
      },
      // Admin exclusive routes
      {
        path: 'admin-approvals',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('../pages/admin/approvals/admin-approvals.component').then((m) => m.AdminApprovalsComponent),
      },
      {
        path: 'admin-escalations',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('../pages/admin/escalations/admin-escalations.component').then((m) => m.AdminEscalationsComponent),
      },
      {
        path: 'admin-overview',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('../pages/admin/overview/admin-overview.component').then((m) => m.AdminOverviewComponent),
      },
      // Profile for all authenticated roles
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/profile/account-profile.component').then((m) => m.AccountProfileComponent),
      },
      {
        path: '',
        redirectTo: 'feedback',
        pathMatch: 'full',
      },
    ],
  },
];
