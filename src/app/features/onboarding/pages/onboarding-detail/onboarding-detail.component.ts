import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingStore } from '../../services/onboarding.store';
import { OnboardingApiService } from '../../services/onboarding-api.service';
import {
  OnboardingCandidate,
  OnboardingChecklist,
  OnboardingDocument,
  OnboardingStatus,
} from '../../models/onboarding.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-onboarding-detail',
  standalone: false,
  templateUrl: './onboarding-detail.component.html',
  styleUrls: ['./onboarding-detail.component.scss'],
})
export class OnboardingDetailComponent implements OnInit {
  private readonly store = inject(OnboardingStore);
  private readonly api = inject(OnboardingApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly candidate = this.store.selected;
  readonly loading = this.store.loading;

  readonly checklist = signal<OnboardingChecklist[]>([]);
  readonly documents = signal<OnboardingDocument[]>([]);
  readonly activeTab = signal<number>(0);

  readonly canComplete = this.store.canComplete;

  readonly displayedChecklistColumns = [
    'completed',
    'title',
    'category',
    'assignedTo',
    'dueDate',
    'actions',
  ];
  readonly displayedDocumentColumns = [
    'documentType',
    'fileName',
    'uploadedAt',
    'verified',
    'actions',
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadCandidateById(+id);
      this.loadChecklist(+id);
      this.loadDocuments(+id);
    }
  }

  loadChecklist(candidateId: number): void {
    this.api.getChecklist(candidateId).subscribe({
      next: (checklist) => this.checklist.set(checklist),
      error: () => this.checklist.set([]),
    });
  }

  loadDocuments(candidateId: number): void {
    this.api.getDocuments(candidateId).subscribe({
      next: (documents) => this.documents.set(documents),
      error: () => this.documents.set([]),
    });
  }

  toggleChecklistItem(item: OnboardingChecklist, onboardingId?: number): void {
    const updated = { ...item, completed: !item.completed };
    const id = onboardingId || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.updateChecklistItem(+id, item.id, { completed: !item.completed }).subscribe({
        next: () => {
          this.checklist.update((items) => items.map((i) => (i.id === item.id ? updated : i)));
        },
      });
    }
  }

  verifyDocument(docId: number, verified: boolean): void {
    this.api.verifyDocument(docId, verified).subscribe({
      next: () => {
        this.documents.update((docs) =>
          docs.map((doc) => (doc.id === docId ? { ...doc, verified } : doc)),
        );
      },
    });
  }

  completeOnboarding(): void {
    const candidate = this.candidate();
    if (candidate) {
      this.store.completeOnboarding(candidate.id).subscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/onboarding', 'list']);
  }

  getFullName(candidate: OnboardingCandidate): string {
    return `${candidate.firstName} ${candidate.lastName}`;
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

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'document':
        return 'Document';
      case 'it_setup':
        return 'IT Setup';
      case 'admin':
        return 'Admin';
      case 'induction':
        return 'Induction';
      default:
        return category;
    }
  }
}
