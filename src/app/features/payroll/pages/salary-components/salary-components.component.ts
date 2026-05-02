import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SalaryComponent, SalaryComponentType } from '../../models/payroll.model';

@Component({
  selector: 'app-salary-components',
  standalone: false,
  template: `
    <div class="salary-components-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_balance_wallet</mat-icon>
            Salary Components
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openComponentDialog()">
              <mat-icon>add</mat-icon> Add Component
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Filter by Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (ngModelChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="earning">Earning</mat-option>
                <mat-option value="deduction">Deduction</mat-option>
                <mat-option value="reimbursement">Reimbursement</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Filter by Category</mat-label>
              <mat-select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="basic">Basic</mat-option>
                <mat-option value="allowance">Allowance</mat-option>
                <mat-option value="bonus">Bonus</mat-option>
                <mat-option value="statutory">Statutory</mat-option>
                <mat-option value="loan">Loan</mat-option>
                <mat-option value="tax">Tax</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input
                matInput
                [(ngModel)]="searchText"
                (ngModelChange)="applyFilter()"
                placeholder="Search by name or code"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <table mat-table [dataSource]="filteredComponents" class="full-width-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let row">{{ row.name }}</td>
            </ng-container>
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let row">{{ row.code }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip
                  [color]="
                    row.type === 'earning'
                      ? 'primary'
                      : row.type === 'deduction'
                        ? 'warn'
                        : 'accent'
                  "
                  selected
                >
                  {{ row.type | titlecase }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let row">
                <span class="category-badge">{{ row.category | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="isTaxable">
              <th mat-header-cell *matHeaderCellDef>Taxable</th>
              <td mat-cell *matCellDef="let row">
                <mat-icon [color]="row.isTaxable ? 'primary' : 'disabled'">
                  {{ row.isTaxable ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>
            <ng-container matColumnDef="isStatutory">
              <th mat-header-cell *matHeaderCellDef>Statutory</th>
              <td mat-cell *matCellDef="let row">
                <mat-icon [color]="row.isStatutory ? 'warn' : 'disabled'">
                  {{ row.isStatutory ? 'gavel' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>
            <ng-container matColumnDef="calculationType">
              <th mat-header-cell *matHeaderCellDef>Calc Type</th>
              <td mat-cell *matCellDef="let row">{{ row.calculationType | titlecase }}</td>
            </ng-container>
            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Active</th>
              <td mat-cell *matCellDef="let row">
                <mat-icon [color]="row.isActive ? 'primary' : 'warn'">
                  {{ row.isActive ? 'toggle_on' : 'toggle_off' }}
                </mat-icon>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="menu"
                  (click)="$event.stopPropagation()"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editComponent(row)">
                    <mat-icon>edit</mat-icon> Edit
                  </button>
                  <button mat-menu-item (click)="toggleActive(row)">
                    <mat-icon>{{ row.isActive ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                    {{ row.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button mat-menu-item (click)="deleteComponent(row)" class="delete-action">
                    <mat-icon>delete</mat-icon> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./salary-components.component.scss'],
})
export class SalaryComponentsComponent implements OnInit {
  components: SalaryComponent[] = [];
  filteredComponents: SalaryComponent[] = [];
  displayedColumns: string[] = [
    'name',
    'code',
    'type',
    'category',
    'isTaxable',
    'isStatutory',
    'calculationType',
    'isActive',
    'actions',
  ];
  selectedType = '';
  selectedCategory = '';
  searchText = '';

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadComponents();
  }

  loadComponents() {
    this.components = [
      {
        id: 1,
        name: 'Basic Salary',
        code: 'BASIC',
        type: 'earning',
        category: 'basic',
        isTaxable: true,
        isStatutory: false,
        calculationType: 'fixed',
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 2,
        name: 'House Rent Allowance',
        code: 'HRA',
        type: 'earning',
        category: 'allowance',
        isTaxable: true,
        isStatutory: false,
        calculationType: 'percentage',
        percentageOf: 'BASIC',
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 3,
        name: 'PF Deduction',
        code: 'PF',
        type: 'deduction',
        category: 'statutory',
        isTaxable: false,
        isStatutory: true,
        calculationType: 'percentage',
        percentageOf: 'BASIC',
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 4,
        name: 'Income Tax',
        code: 'TAX',
        type: 'deduction',
        category: 'tax',
        isTaxable: false,
        isStatutory: true,
        calculationType: 'formula',
        formula: 'gross * 0.1',
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 5,
        name: 'Travel Allowance',
        code: 'TA',
        type: 'reimbursement',
        category: 'allowance',
        isTaxable: false,
        isStatutory: false,
        calculationType: 'fixed',
        isActive: true,
        displayOrder: 3,
      },
    ];
    this.applyFilter();
  }

  applyFilter() {
    this.filteredComponents = this.components.filter((c) => {
      const matchesType = !this.selectedType || c.type === this.selectedType;
      const matchesCategory = !this.selectedCategory || c.category === this.selectedCategory;
      const matchesSearch =
        !this.searchText ||
        c.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.code.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }

  openComponentDialog(component?: SalaryComponent) {
    this.snackBar.open(
      'Component dialog - ' + (component ? 'Edit' : 'Add') + ' functionality to be implemented',
      'Close',
      { duration: 3000 },
    );
  }

  editComponent(component: SalaryComponent) {
    this.openComponentDialog(component);
  }

  toggleActive(component: SalaryComponent) {
    component.isActive = !component.isActive;
    this.snackBar.open(`Component ${component.isActive ? 'activated' : 'deactivated'}`, 'Close', {
      duration: 3000,
    });
  }

  deleteComponent(component: SalaryComponent) {
    if (confirm(`Delete ${component.name}?`)) {
      this.components = this.components.filter((c) => c.id !== component.id);
      this.applyFilter();
      this.snackBar.open('Component deleted', 'Close', { duration: 3000 });
    }
  }
}
