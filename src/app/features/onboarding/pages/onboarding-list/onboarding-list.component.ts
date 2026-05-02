import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { OnboardingStore } from '../../services/onboarding.store';
import { OnboardingCandidate, OnboardingStatus } from '../../models/onboarding.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-onboarding-list',
  standalone: false,
  templateUrl: './onboarding-list.component.html',
  styleUrls: ['./onboarding-list.component.scss'],
})
export class OnboardingListComponent implements OnInit {
  private readonly store = inject(OnboardingStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly candidates = this.store.items;
  readonly loading = this.store.loading;
  readonly total = this.store.total;
  readonly page = this.store.page;
  readonly limit = this.store.limit;

  readonly canComplete = this.store.canComplete;
  readonly canCancel = this.store.canCancel;

  readonly displayedColumns = [
    'name',
    'position',
    'department',
    'joiningDate',
    'status',
    'progress',
    'actions',
  ];

  readonly statusOptions = [
    { value: '', label: 'All' },
    { value: OnboardingStatus.PENDING, label: 'Pending' },
    { value: OnboardingStatus.IN_PROGRESS, label: 'In Progress' },
    { value: OnboardingStatus.COMPLETED, label: 'Completed' },
    { value: OnboardingStatus.CANCELLED, label: 'Cancelled' },
  ];

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      startDate: [''],
      endDate: [''],
      department: [''],
    });
  }

  ngOnInit(): void {
    this.store.loadCandidates();
  }

  applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    this.store.setOnboardingFilters(filters);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.store.clearFilters();
  }

  viewCandidate(id: number): void {
    this.router.navigate(['/onboarding', id]);
  }

  completeOnboarding(id: number): void {
    this.store.completeOnboarding(id).subscribe();
  }

  cancelOnboarding(id: number): void {
    // TODO: Implement cancel API call
  }

  getStatusClass(status: OnboardingStatus): string {
    switch (status) {
      case OnboardingStatus.PENDING:
        return 'status-pending';
      case OnboardingStatus.IN_PROGRESS:
        return 'status-in-progress';
      case OnboardingStatus.COMPLETED:
        return 'status-completed';
      case OnboardingStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getFullName(candidate: OnboardingCandidate): string {
    return `${candidate.firstName} ${candidate.lastName}`;
  }

  changePage(page: number): void {
    this.store.changePage(page);
  }

  changePageSize(limit: number): void {
    this.store.changePageSize(limit);
  }
}
