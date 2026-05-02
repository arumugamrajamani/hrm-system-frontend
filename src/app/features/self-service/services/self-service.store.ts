import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ESSDashboard, ESSProfileUpdate } from '../models/self-service.model';
import { SelfServiceApiService } from './self-service-api.service';

@Injectable({ providedIn: 'root' })
export class SelfServiceStore {
  private dashboardSubject = new BehaviorSubject<ESSDashboard | null>(null);
  private profileUpdatesSubject = new BehaviorSubject<ESSProfileUpdate[]>([]);
  private documentsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  dashboard$: Observable<ESSDashboard | null> = this.dashboardSubject.asObservable();
  profileUpdates$: Observable<ESSProfileUpdate[]> = this.profileUpdatesSubject.asObservable();
  documents$: Observable<any[]> = this.documentsSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private api: SelfServiceApiService) {}

  loadDashboard(): void {
    this.loadingSubject.next(true);
    this.api.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboardSubject.next(dashboard);
        this.loadingSubject.next(false);
      },
      error: () => this.loadingSubject.next(false),
    });
  }

  loadProfileUpdates(): void {
    this.api.getProfileUpdates().subscribe({
      next: (updates) => this.profileUpdatesSubject.next(updates),
    });
  }

  submitProfileUpdate(data: Partial<ESSProfileUpdate>): Observable<ESSProfileUpdate> {
    return this.api.requestProfileUpdate(data);
  }

  loadDocuments(): void {
    this.api.getMyDocuments().subscribe({
      next: (docs) => this.documentsSubject.next(docs),
    });
  }
}
