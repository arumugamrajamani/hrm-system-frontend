import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

export interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  color?: string;
  icon?: string;
}

export interface KanbanColumnConfig {
  id: string;
  title: string;
  color: string;
  items: KanbanItem[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kanban-board">
      <div class="columns-container">
        @for (column of columns; track column.id) {
          <div class="kanban-column">
            <div class="column-header" [style.borderTopColor]="column.color">
              <div class="column-title">
                <span class="column-dot" [style.backgroundColor]="column.color"></span>
                <span>{{ column.title }}</span>
                <span class="column-count">{{ column.items.length }}</span>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="columnMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #columnMenu="matMenu">
                <button mat-menu-item>
                  <mat-icon>filter_list</mat-icon>
                  <span>Filter</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>sort</mat-icon>
                  <span>Sort</span>
                </button>
              </mat-menu>
            </div>

            <div
              class="column-content"
              cdkDropList
              [id]="column.id"
              [cdkDropListData]="column.items"
              [cdkDropListConnectedTo]="getConnectedLists(column.id)"
              (cdkDropListDropped)="onDrop($event)"
            >
              @for (item of column.items; track item.id) {
                <div
                  class="kanban-card"
                  cdkDrag
                  [cdkDragData]="item"
                  (click)="onCardClick(item, column)"
                >
                  <div class="card-drag-preview" *cdkDragPreview>
                    <div class="card-preview-content">
                      @if (item.icon) {
                        <mat-icon>{{ item.icon }}</mat-icon>
                      }
                      <span>{{ item.title }}</span>
                    </div>
                  </div>

                  <div class="card-content">
                    @if (item.icon || item.color) {
                      <div class="card-icon" [style.backgroundColor]="item.color || '#3f51b5'">
                        <mat-icon>{{ item.icon || 'description' }}</mat-icon>
                      </div>
                    }
                    <div class="card-body">
                      <h4 class="card-title">{{ item.title }}</h4>
                      @if (item.subtitle) {
                        <p class="card-subtitle">{{ item.subtitle }}</p>
                      }
                      @if (item.meta && item.meta.length > 0) {
                        <div class="card-meta">
                          @for (m of item.meta; track m.label) {
                            <span class="meta-item">
                              <span class="meta-label">{{ m.label }}:</span>
                              <span class="meta-value">{{ m.value }}</span>
                            </span>
                          }
                        </div>
                      }
                    </div>
                    <div class="card-actions">
                      <button mat-icon-button (click)="onAction($event, item, 'view')">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button (click)="onAction($event, item, 'edit')">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-column">
                  <mat-icon>inbox</mat-icon>
                  <p>No items</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .kanban-board {
        height: 100%;
        overflow-x: auto;
        padding: 16px;
      }

      .columns-container {
        display: flex;
        gap: 16px;
        min-height: calc(100vh - 200px);
      }

      .kanban-column {
        flex: 0 0 300px;
        background: #f5f7fa;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 250px);
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: white;
        border-radius: 12px 12px 0 0;
        border-top: 4px solid;
      }

      .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #1a202c;
      }

      .column-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .column-count {
        background: #e2e8f0;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        color: #4a5568;
      }

      .column-content {
        flex: 1;
        padding: 8px;
        overflow-y: auto;
        min-height: 200px;
      }

      .kanban-card {
        background: white;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: grab;
        transition: all 0.2s;
      }

      .kanban-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .kanban-card:active {
        cursor: grabbing;
      }

      .card-drag-preview {
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .card-preview-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
      }

      .card-content {
        display: flex;
        gap: 12px;
      }

      .card-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .card-icon mat-icon {
        color: white;
        font-size: 20px;
      }

      .card-body {
        flex: 1;
        min-width: 0;
      }

      .card-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a202c;
        margin: 0 0 4px;
      }

      .card-subtitle {
        font-size: 12px;
        color: #718096;
        margin: 0 0 8px;
      }

      .card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 11px;
      }

      .meta-item {
        background: #f7fafc;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .meta-label {
        color: #718096;
      }

      .meta-value {
        color: #1a202c;
        font-weight: 500;
      }

      .card-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .kanban-card:hover .card-actions {
        opacity: 1;
      }

      .card-actions button {
        width: 28px;
        height: 28px;
      }

      .card-actions mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .empty-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #a0aec0;
        text-align: center;
      }

      .empty-column mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        margin-bottom: 8px;
        opacity: 0.5;
      }

      .empty-column p {
        margin: 0;
        font-size: 13px;
      }

      .cdk-drag-placeholder {
        background: #e2e8f0;
        border: 2px dashed #cbd5e0;
        border-radius: 8px;
        min-height: 80px;
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .column-content.cdk-drop-list-dragging .kanban-card:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class KanbanBoardComponent {
  @Input() columns: KanbanColumnConfig[] = [];
  @Input() connectedLists: string[] = [];
  @Output() itemDropped = new EventEmitter<{
    item: KanbanItem;
    previousColumn: string;
    currentColumn: string;
    previousIndex: number;
    currentIndex: number;
  }>();
  @Output() cardClicked = new EventEmitter<{ item: KanbanItem; column: KanbanColumnConfig }>();
  @Output() actionClicked = new EventEmitter<{ event: Event; item: KanbanItem; action: string }>();

  getConnectedLists(currentId: string): string[] {
    return this.connectedLists.filter((id) => id !== currentId);
  }

  onDrop(event: CdkDragDrop<KanbanItem[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.itemDropped.emit({
      item: event.item.data,
      previousColumn: event.previousContainer.id,
      currentColumn: event.container.id,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }

  onCardClick(item: KanbanItem, column: KanbanColumnConfig): void {
    this.cardClicked.emit({ item, column });
  }

  onAction(event: Event, item: KanbanItem, action: string): void {
    event.stopPropagation();
    this.actionClicked.emit({ event, item, action });
  }
}
