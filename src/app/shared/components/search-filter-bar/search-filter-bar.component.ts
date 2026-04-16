import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange';
  options?: { label: string; value: any }[];
  placeholder?: string;
}

@Component({
  selector: 'app-search-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-filter-bar" [formGroup]="filterForm">
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            [placeholder]="searchPlaceholder"
            formControlName="search"
            (input)="onSearchChange()"
          />
          @if (filterForm.get('search')?.value) {
            <button matSuffix mat-icon-button (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      @if (filters.length > 0) {
        <div class="filter-section">
          @for (filter of filters; track filter.key) {
            @switch (filter.type) {
              @case ('select') {
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>{{ filter.label }}</mat-label>
                  <mat-select [formControlName]="filter.key">
                    <mat-option [value]="''">All</mat-option>
                    @for (option of filter.options; track option.value) {
                      <mat-option [value]="option.value">{{ option.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }
              @case ('date') {
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>{{ filter.label }}</mat-label>
                  <input matInput [matDatepicker]="picker" [formControlName]="filter.key" />
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
              }
              @case ('daterange') {
                <mat-form-field appearance="outline" class="filter-field date-range">
                  <mat-label>{{ filter.label }}</mat-label>
                  <mat-date-range-input [rangePicker]="rangePicker">
                    <input
                      matStartDate
                      [formControlName]="filter.key + 'From'"
                      placeholder="Start"
                    />
                    <input matEndDate [formControlName]="filter.key + 'To'" placeholder="End" />
                  </mat-date-range-input>
                  <mat-datepicker-toggle matSuffix [for]="rangePicker"></mat-datepicker-toggle>
                  <mat-date-range-picker #rangePicker></mat-date-range-picker>
                </mat-form-field>
              }
              @default {
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>{{ filter.label }}</mat-label>
                  <input
                    matInput
                    [formControlName]="filter.key"
                    [placeholder]="filter.placeholder || filter.label"
                  />
                </mat-form-field>
              }
            }
          }
        </div>
      }

      @if (hasActiveFilters) {
        <div class="active-filters">
          <mat-chip-listbox>
            @for (filter of activeFilters; track filter.key) {
              <mat-chip (removed)="removeFilter(filter.key)">
                {{ filter.label }}: {{ filter.value }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }
          </mat-chip-listbox>
          <button mat-button (click)="clearAllFilters()">Clear All</button>
        </div>
      }

      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .search-filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        padding: 16px;
        background: var(--surface, white);
        border-radius: 8px;
      }

      .search-section {
        flex: 1;
        min-width: 250px;
      }

      .search-field {
        width: 100%;
      }

      .filter-section {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .filter-field {
        min-width: 150px;
      }

      .filter-field.date-range {
        min-width: 280px;
      }

      .active-filters {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      mat-form-field {
        height: 56px;
      }
    `,
  ],
})
export class SearchFilterBarComponent implements OnInit, OnDestroy {
  @Input() searchPlaceholder = 'Search...';
  @Input() filters: FilterOption[] = [];
  @Input() debounceTime = 300;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<Record<string, any>>();
  @Output() filterRemove = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();

  filterForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  get hasActiveFilters(): boolean {
    return this.activeFilters.length > 0;
  }

  get activeFilters(): { key: string; label: string; value: any }[] {
    const active: { key: string; label: string; value: any }[] = [];
    const searchValue = this.filterForm?.get('search')?.value;

    if (searchValue) {
      active.push({ key: 'search', label: 'Search', value: searchValue });
    }

    this.filters.forEach((filter) => {
      const value = this.filterForm?.get(filter.key)?.value;
      if (value) {
        if (filter.type === 'select') {
          const option = filter.options?.find((o) => o.value === value);
          active.push({ key: filter.key, label: filter.label, value: option?.label || value });
        } else {
          active.push({ key: filter.key, label: filter.label, value });
        }
      }
    });

    return active;
  }

  ngOnInit(): void {
    this.initForm();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    const formControls: Record<string, any> = { search: '' };
    this.filters.forEach((filter) => {
      formControls[filter.key] = '';
      if (filter.type === 'daterange') {
        formControls[filter.key + 'From'] = '';
        formControls[filter.key + 'To'] = '';
      }
    });
    this.filterForm = new FormBuilder().group(formControls);
  }

  private setupSubscriptions(): void {
    this.searchSubject
      .pipe(debounceTime(this.debounceTime), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.searchChange.emit(search);
      });

    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((values) => {
      this.filtersChange.emit(values);
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.filterForm.get('search')?.value);
  }

  clearSearch(): void {
    this.filterForm.patchValue({ search: '' });
    this.searchChange.emit('');
  }

  removeFilter(key: string): void {
    if (key === 'search') {
      this.clearSearch();
    } else {
      this.filterForm.patchValue({ [key]: '' });
    }
    this.filterRemove.emit(key);
  }

  clearAllFilters(): void {
    this.filterForm.reset();
    this.searchChange.emit('');
    this.clearAll.emit();
  }

  getFilters(): Record<string, any> {
    return this.filterForm.value;
  }

  setFilters(filters: Record<string, any>): void {
    this.filterForm.patchValue(filters);
  }
}
