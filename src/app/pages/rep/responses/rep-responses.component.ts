import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonContent, IonBadge, IonIcon, IonButton, IonSearchbar,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  barChartOutline, downloadOutline, filterOutline,
  alertCircleOutline, checkmarkCircleOutline, refreshOutline,
  star, chevronDownOutline, chevronUpOutline, searchOutline,
  shieldCheckmarkOutline, documentTextOutline, closeCircleOutline
} from 'ionicons/icons';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { AnalyticsFilterQuery } from '../../../models/api/analytics.models';
import { ExportRequest } from '../../../models/api/export.models';

@Component({
  selector: 'app-rep-responses',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonBadge, IonIcon, IonButton, IonSearchbar
  ],
  styles: [`
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px}
.kpi-card{background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:12px;display:flex;flex-direction:column;justify-content:space-between}
.kpi-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#5d6f7c;margin-bottom:4px}
.kpi-value{font-size:1.45rem;font-weight:800;color:#003087;line-height:1.1}
.kpi-subtext{font-size:0.7rem;color:#64748b;margin-top:4px}
.chart-container{background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin-bottom:16px}
.rating-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:0.8rem}
.rating-stars{display:flex;align-items:center;width:45px;color:#ed8b00;font-weight:700}
.rating-bar-wrapper{flex:1;background:#e2e8f0;height:10px;border-radius:5px;overflow:hidden}
.rating-bar-fill{background:#005eb8;height:100%;border-radius:5px;transition:width .3s}
.rating-count{width:55px;text-align:right;font-weight:600;color:#475569}
.filter-card{background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:12px 16px;margin-bottom:16px}
.filter-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0}
.custom-select{background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;font-size:0.82rem;padding:6px 8px;width:100%;color:#1e293b;outline:none}
.active-survey-pill{background:#e0f2fe;border:1px solid #005eb8;border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}
.sub-card{background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin-bottom:12px;border-left:4px solid #005eb8}
.sub-card.flagged{border-left:4px solid #d5281b;background:#fffafa}
.qa-box{background:#f8fafc;border-radius:8px;padding:10px 12px;margin:8px 0;border:1px solid #e2e8f0}
  `],
  template: `
    <ion-content class="ion-padding" style="--background: #f0f4f5;">
      <div class="app-container">

        <!-- Top Header & Simple Excel Export -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
          <div>
            <h1 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #003087;">
              Analytics & Responses
            </h1>
            <p style="margin: 2px 0 0; font-size: 0.8rem; color: #475569;">
              Review feedback and training insights across hospitals.
            </p>
          </div>

          <ion-button color="success" size="small" (click)="exportExcel()" style="--box-shadow: none;">
            <ion-icon name="document-text-outline" slot="start"></ion-icon>
            Export to Excel
          </ion-button>
        </div>

        <!-- Active Filter Indicator Banner if specific survey is selected -->
        @if (selectedSurveyId() !== 'all' && currentSurvey()) {
          <div class="active-survey-pill">
            <div style="font-size: 0.82rem; color: #003087;">
              Filtering by: <strong>{{ currentSurvey()?.title }}</strong>
            </div>
            <button
              type="button"
              (click)="clearSurveyFilter()"
              style="background: transparent; border: none; color: #005eb8; font-weight: 700; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; gap: 4px;"
            >
              <span>Show All Surveys</span>
              <ion-icon name="close-circle-outline"></ion-icon>
            </button>
          </div>
        }

        <!-- Collapsible Multi-Criteria Filter Card -->
        <div class="filter-card">
          <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" (click)="toggleFilter()">
            <div style="display: flex; align-items: center; gap: 8px;">
              <ion-icon name="filter-outline" style="font-size: 18px; color: #003087;"></ion-icon>
              <span style="font-weight: 700; font-size: 0.9rem; color: #003087;">Filters</span>
              @if (activeFilterCount() > 0) {
                <ion-badge color="primary">{{ activeFilterCount() }} active</ion-badge>
              }
              <span style="font-size: 0.78rem; color: #64748b;">
                ({{ filteredSubmissions().length }} matched)
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              @if (activeFilterCount() > 0) {
                <button
                  type="button"
                  (click)="$event.stopPropagation(); resetFilters()"
                  style="background: transparent; border: none; color: #005eb8; font-size: 0.75rem; font-weight: 600; cursor: pointer;"
                >
                  Reset
                </button>
              }
              <ion-icon [name]="isFilterOpen() ? 'chevron-up-outline' : 'chevron-down-outline'" style="color: #64748b;"></ion-icon>
            </div>
          </div>

          <!-- Expandable Filter Options -->
          @if (isFilterOpen()) {
            <div style="margin-top: 10px;">
              <ion-searchbar
                [ngModel]="searchKeyword()"
                (ngModelChange)="searchKeyword.set($event)"
                placeholder="Search comments, department, or hospital..."
                style="padding: 0; --background: #f8fafc; --box-shadow: none; border-radius: 8px; border: 1px solid #cbd5e1;"
              ></ion-searchbar>
            </div>

            <div class="filter-grid">
              <!-- Survey Filter -->
              <div>
                <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">SURVEY</label>
                <select
                  class="custom-select"
                  [ngModel]="selectedSurveyId()"
                  (ngModelChange)="selectedSurveyId.set($event)"
                >
                  <option value="all">All Surveys ({{ mockData.submissions().length }} submissions)</option>
                  @for (s of mockData.surveys(); track s.id) {
                    <option [value]="s.id">{{ s.title }} ({{ getSurveyCount(s.id) }})</option>
                  }
                </select>
              </div>

              <!-- Sector Filter -->
              <div>
                <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">SECTOR</label>
                <select
                  class="custom-select"
                  [ngModel]="selectedSectorId()"
                  (ngModelChange)="selectedSectorId.set($event); selectedHospitalId.set('all')"
                >
                  <option value="all">All Sectors</option>
                  @for (sec of mockData.sectors(); track sec.id) {
                    <option [value]="sec.id">{{ sec.name }} ({{ sec.code }})</option>
                  }
                </select>
              </div>

              <!-- Hospital Filter -->
              <div>
                <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">HOSPITAL</label>
                <select
                  class="custom-select"
                  [ngModel]="selectedHospitalId()"
                  (ngModelChange)="selectedHospitalId.set($event)"
                >
                  <option value="all">All Hospitals</option>
                  @for (h of eligibleHospitals(); track h.id) {
                    <option [value]="h.id">{{ h.name }}</option>
                  }
                </select>
              </div>

              <!-- Department Filter -->
              <div>
                <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">DEPARTMENT</label>
                <select
                  class="custom-select"
                  [ngModel]="selectedDepartment()"
                  (ngModelChange)="selectedDepartment.set($event)"
                >
                  <option value="all">All Departments</option>
                  @for (d of mockData.departments(); track d.id) {
                    <option [value]="d.name">{{ d.name }}</option>
                  }
                </select>
              </div>

              <!-- Training Grade Filter -->
              <div>
                <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">GRADE</label>
                <select
                  class="custom-select"
                  [ngModel]="selectedGrade()"
                  (ngModelChange)="selectedGrade.set($event)"
                >
                  <option value="all">All Grades</option>
                  <option value="FY1">FY1</option>
                  <option value="FY2">FY2</option>
                  <option value="ST2">ST1-2</option>
                  <option value="ST3">ST3</option>
                  <option value="ST4">ST4</option>
                  <option value="ST5">ST5+</option>
                </select>
              </div>

              <!-- Safety Concerns Toggle -->
              <div style="display: flex; align-items: center; gap: 8px; padding-top: 18px;">
                <input
                  type="checkbox"
                  id="onlyFlagged"
                  [checked]="onlyFlagged()"
                  (change)="onlyFlagged.set(!onlyFlagged())"
                  style="width: 18px; height: 18px; accent-color: #d5281b; cursor: pointer;"
                />
                <label for="onlyFlagged" style="font-size: 0.8rem; font-weight: 700; color: #d5281b; cursor: pointer;">
                  Serious Incidents Only
                </label>
              </div>
            </div>
          }
        </div>

        <!-- Executive KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Submissions</span>
            <div class="kpi-value">{{ analytics().totalSubmissions }}</div>
            <span class="kpi-subtext">Total received</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Response Rate</span>
            <div class="kpi-value" style="color: #007f3b;">{{ analytics().responseRatePercentage }}%</div>
            <span class="kpi-subtext">Of eligible cohort</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Satisfaction</span>
            <div class="kpi-value" [style.color]="getRatingColor(analytics().overallSatisfactionScore)">
              {{ analytics().overallSatisfactionScore }} <span style="font-size: 0.9rem; font-weight: 600;">/ 5.0</span>
            </div>
            <span class="kpi-subtext">Average score</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Safe Staffing</span>
            <div class="kpi-value" [style.color]="analytics().safeStaffingIndex >= 70 ? '#007f3b' : '#ed8b00'">
              {{ analytics().safeStaffingIndex }}%
            </div>
            <span class="kpi-subtext">Adequate cover</span>
          </div>

          <div class="kpi-card" style="border-left: 4px solid #d5281b;">
            <span class="kpi-label" style="color: #d5281b;">Safety Flags</span>
            <div class="kpi-value" style="color: #d5281b;">{{ analytics().flaggedIncidentsCount }}</div>
            <span class="kpi-subtext">Flagged incidents</span>
          </div>
        </div>

        <!-- Visual Analytics: Charts Section -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 16px;">

          <!-- Rating Distribution Graph -->
          <div class="chart-container">
            <h3 style="margin: 0 0 12px; font-size: 0.92rem; font-weight: 700; color: #003087;">
              Workload Rating Distribution
            </h3>

            @for (starLevel of [5, 4, 3, 2, 1]; track starLevel) {
              <div class="rating-row">
                <div class="rating-stars">
                  <span>{{ starLevel }}</span>
                  <ion-icon name="star" style="font-size: 14px; margin-left: 2px;"></ion-icon>
                </div>
                <div class="rating-bar-wrapper">
                  <div
                    class="rating-bar-fill"
                    [style.width.%]="getRatingPercentage(starLevel)"
                    [style.background]="getBarColor(starLevel)"
                  ></div>
                </div>
                <div class="rating-count">
                  {{ analytics().ratingDistribution[starLevel] || 0 }} ({{ getRatingPercentage(starLevel) }}%)
                </div>
              </div>
            }
          </div>

          <!-- Department Participation Matrix -->
          <div class="chart-container">
            <h3 style="margin: 0 0 12px; font-size: 0.92rem; font-weight: 700; color: #003087;">
              Department Breakdown
            </h3>

            @for (dept of analytics().departmentMetrics; track dept.departmentName) {
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 2px;">
                  <span style="color: #212b32;">{{ dept.departmentName }}</span>
                  <span style="color: #005eb8;">
                    {{ dept.count }} &bull; {{ dept.averageRating }}/5.0
                    @if (dept.flaggedCount > 0) {
                      <span style="color: #d5281b; font-weight: 700; margin-left: 4px;">({{ dept.flaggedCount }} alert)</span>
                    }
                  </span>
                </div>
                <div class="rating-bar-wrapper" style="height: 8px;">
                  <div
                    class="rating-bar-fill"
                    [style.width.%]="dept.percentage"
                    [style.background]="dept.flaggedCount > 0 ? '#d5281b' : '#005eb8'"
                  ></div>
                </div>
              </div>
            }
            @if (analytics().departmentMetrics.length === 0) {
              <div style="font-size: 0.8rem; color: #64748b; padding: 12px 0;">
                No department data matching current filters.
              </div>
            }
          </div>
        </div>

        <!-- Submissions Explorer (Grouped & Clean Q&A format) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 18px 0 10px;">
          <h2 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #003087;">
            Submissions ({{ filteredSubmissions().length }})
          </h2>
        </div>

        @for (sub of filteredSubmissions(); track sub.id) {
          <div class="sub-card" [class.flagged]="sub.incident.isFlagged">
            <!-- Card Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span class="nhs-tag nhs-tag-blue" style="font-size: 0.7rem;">
                    {{ sub.hospitalName }}
                  </span>
                  <span class="nhs-tag" style="background: #f1f5f9; color: #334155; font-size: 0.7rem;">
                    {{ sub.departmentName }}
                  </span>
                  <span class="nhs-tag" style="background: #e0f2fe; color: #0369a1; font-size: 0.7rem;">
                    {{ sub.grade }}
                  </span>
                </div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #003087; margin-top: 4px;">
                  {{ sub.surveyTitle }}
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 0.72rem; color: #64748b;">
                  {{ sub.submittedAt }}
                </div>
                @if (sub.incident.isFlagged) {
                  <ion-badge color="danger" style="margin-top: 4px;">Safety Flagged</ion-badge>
                }
              </div>
            </div>

            <!-- Trainee Q&A Answers Section -->
            <div class="qa-box">
              @for (ans of sub.answers; track ans.questionId) {
                <div style="margin-bottom: 6px; font-size: 0.8rem; line-height: 1.35;">
                  <div style="font-weight: 700; color: #005eb8;">
                    Q: {{ getQuestionTitle(sub.surveyId, ans.questionId) }}
                  </div>
                  <div style="color: #1e293b; padding-left: 14px;">
                    A: <span [style.font-weight]="isRatingQuestion(ans.value) ? '700' : 'normal'">
                      {{ formatAnswerValue(ans.value) }}
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Flagged Safety Incident Callout if applicable -->
            @if (sub.incident.isFlagged) {
              <div style="background: #fbeae8; border-left: 3px solid #d5281b; padding: 8px 12px; border-radius: 4px; font-size: 0.78rem; color: #661007; margin-top: 8px;">
                <strong>Safety Incident:</strong>
                "{{ sub.incident.concernSummary }}"
              </div>
            }

            <!-- Author Anonymity Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 0.72rem; color: #64748b;">
              <div>
                Trainee Identity: <strong>[Anonymous]</strong>
              </div>
              <span>Ref: {{ sub.id }}</span>
            </div>
          </div>
        }

        @if (filteredSubmissions().length === 0) {
          <div style="text-align: center; padding: 40px 16px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <ion-icon name="search-outline" style="font-size: 40px; color: #94a3b8;"></ion-icon>
            <h3 style="margin: 8px 0 4px; font-size: 1rem; font-weight: 700; color: #334155;">No submissions match the selected filters</h3>
            <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Try adjusting the filter criteria.</p>
            <ion-button size="small" fill="outline" style="margin-top: 12px;" (click)="resetFilters()">
              Reset All Filters
            </ion-button>
          </div>
        }

      </div>
    </ion-content>
  `
})
export class RepResponsesComponent implements OnInit, OnDestroy {
  readonly mockData = inject(MockDataService);
  readonly auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private toastCtrl = inject(ToastController);

  private sub?: Subscription;

  // Reactive Signal Filters
  readonly isFilterOpen = signal<boolean>(false);
  readonly selectedSurveyId = signal<string>('all');
  readonly selectedSectorId = signal<string>('all');
  readonly selectedHospitalId = signal<string>('all');
  readonly selectedDepartment = signal<string>('all');
  readonly selectedGrade = signal<string>('all');
  readonly searchKeyword = signal<string>('');
  readonly onlyFlagged = signal<boolean>(false);

  constructor() {
    addIcons({
      barChartOutline, downloadOutline, filterOutline,
      alertCircleOutline, checkmarkCircleOutline, refreshOutline,
      star, chevronDownOutline, chevronUpOutline, searchOutline,
      shieldCheckmarkOutline, documentTextOutline, closeCircleOutline
    });
  }

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      if (params['surveyId']) {
        this.selectedSurveyId.set(params['surveyId']);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  clearSurveyFilter() {
    this.selectedSurveyId.set('all');
  }

  readonly currentSurvey = computed(() => {
    return this.mockData.surveys().find(s => s.id === this.selectedSurveyId());
  });

  getSurveyCount(surveyId: string): number {
    return this.mockData.submissions().filter(s => s.surveyId === surveyId).length;
  }

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedSurveyId() !== 'all') count++;
    if (this.selectedSectorId() !== 'all') count++;
    if (this.selectedHospitalId() !== 'all') count++;
    if (this.selectedDepartment() !== 'all') count++;
    if (this.selectedGrade() !== 'all') count++;
    if (this.searchKeyword().trim() !== '') count++;
    if (this.onlyFlagged()) count++;
    return count;
  });

  readonly eligibleHospitals = computed(() => {
    const secId = this.selectedSectorId();
    if (secId === 'all') return this.mockData.hospitals();
    return this.mockData.hospitals().filter(h => h.sectorId === secId);
  });

  readonly currentFilterQuery = computed<AnalyticsFilterQuery>(() => {
    return {
      surveyId: this.selectedSurveyId() === 'all' ? undefined : this.selectedSurveyId(),
      sectorIds: this.selectedSectorId() === 'all' ? undefined : [this.selectedSectorId()],
      hospitalIds: this.selectedHospitalId() === 'all' ? undefined : [this.selectedHospitalId()],
      departmentNames: this.selectedDepartment() === 'all' ? undefined : [this.selectedDepartment()],
      grades: this.selectedGrade() === 'all' ? undefined : [this.selectedGrade()],
      onlyFlagged: this.onlyFlagged(),
      searchKeyword: this.searchKeyword()
    };
  });

  readonly filteredSubmissions = computed(() => {
    return this.mockData.getFilteredSubmissions(this.currentFilterQuery());
  });

  readonly analytics = computed(() => {
    return this.mockData.getAnalyticsSummary(this.currentFilterQuery());
  });

  resetFilters() {
    this.selectedSurveyId.set('all');
    this.selectedSectorId.set('all');
    this.selectedHospitalId.set('all');
    this.selectedDepartment.set('all');
    this.selectedGrade.set('all');
    this.searchKeyword.set('');
    this.onlyFlagged.set(false);
  }

  getRatingPercentage(starLevel: number): number {
    const total = this.analytics().totalSubmissions;
    if (total === 0) return 0;
    const count = this.analytics().ratingDistribution[starLevel] || 0;
    return Math.round((count / total) * 100);
  }

  getRatingColor(score: number): string {
    if (score >= 4.0) return '#007f3b';
    if (score >= 3.0) return '#ed8b00';
    return '#d5281b';
  }

  getBarColor(starLevel: number): string {
    if (starLevel >= 4) return '#007f3b';
    if (starLevel === 3) return '#005eb8';
    return '#d5281b';
  }

  isRatingQuestion(val: any): boolean {
    return typeof val === 'number';
  }

  formatAnswerValue(val: any): string {
    if (typeof val === 'number') {
      return `${val} / 5 Rating`;
    }
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return String(val);
  }

  getQuestionTitle(surveyId: string, questionId: string): string {
    const survey = this.mockData.surveys().find(s => s.id === surveyId);
    if (survey) {
      const q = survey.questions.find(quest => quest.id === questionId);
      if (q) return q.title;
    }
    return questionId;
  }

  async exportExcel() {
    const req: ExportRequest = {
      filter: this.currentFilterQuery(),
      format: 'csv',
      includeClinicalGovernanceDisclaimer: false,
      anonymized: true,
      reportTitle: 'Trainee Feedback'
    };

    const result = this.mockData.exportSurveyData(req);

    const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', result.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const toast = await this.toastCtrl.create({
      message: `Downloaded ${result.filename} (${result.metadata.rowCount} records)`,
      color: 'success',
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
}
