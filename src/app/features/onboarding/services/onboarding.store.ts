import { Injectable, inject, computed } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { OnboardingApiService } from './onboarding-api.service';
import { OnboardingCandidate, OnboardingChecklist } from '../models/onboarding.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { BaseStore } from '../../../core/stores/base.store';

@Injectable({ providedIn: 'root' })
export class OnboardingStore extends BaseStore<OnboardingCandidate> {
  private readonly api = inject(OnboardingApiService);
  private readonly rbacService = inject(RbacService);

  readonly canComplete = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canCancel = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadCandidates(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
  }): void {
    this.setLoading(true);

    this.api.list(filters).subscribe({
      next: (response: any) => {
        this.setItems(response.data || response);
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'Failed to load candidates');
        this.setLoading(false);
      },
    });
  }

  loadCandidateById(id: number): void {
    this.setLoading(true);

    this.api.getById(id).subscribe({
      next: (response: any) => {
        this.setSelected(response.data || response);
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'Failed to load candidate');
        this.setLoading(false);
      },
    });
  }

  completeOnboarding(id: number): Observable<OnboardingCandidate> {
    return this.api.complete(id).pipe(
      tap((candidate) => {
        this.updateItemInList(candidate);
        if (this.selected()?.id === id) {
          this.setSelected(candidate);
        }
      }),
    );
  }

  updateChecklistItem(
    onboardingId: number | string,
    itemId: number | string,
    item: Partial<OnboardingChecklist>,
  ): Observable<any> {
    return this.api
      .updateChecklistItem(onboardingId, itemId, item)
      .pipe(map((response: any) => response.data || response));
  }

  setOnboardingFilters(filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
  }): void {
    this.setFilters(filters as Record<string, unknown>);
    this.setPage(1);
    this.loadCandidates(filters);
  }

  clearFilters(): void {
    this.resetFilters();
    this.loadCandidates();
  }

  changePage(page: number): void {
    this.setPage(page);
    this.loadCandidates();
  }

  changePageSize(limit: number): void {
    this.setPageSize(limit);
    this.loadCandidates();
  }
}
