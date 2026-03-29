import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentNode } from '../../models/department.model';

@Component({
  selector: 'app-department-tree',
  standalone: false,
  template: `
    <div class="department-tree">
      @if (treeData.length > 0) {
        <div class="tree-container">
          @for (node of treeData; track node.id) {
            <ng-container *ngTemplateOutlet="treeNode; context: { node: node }"></ng-container>
          }
        </div>
      } @else {
        <div class="empty-state text-center p-4">
          <i class="fas fa-sitemap fa-3x text-muted mb-3"></i>
          <p class="text-muted">No department hierarchy available</p>
        </div>
      }
    </div>

    <ng-template #treeNode let-node="node">
      <div class="tree-item" [style.padding-left.px]="(node.level || 0) * 30">
        <div class="tree-node" (click)="toggleNode(node)">
          <div class="node-content">
            @if (node.children && node.children.length > 0) {
              <i
                class="fas"
                [class.fa-chevron-right]="!node.expanded"
                [class.fa-chevron-down]="node.expanded"
              ></i>
            } @else {
              <i class="fas fa-minus opacity-0"></i>
            }
            <i class="fas fa-building text-primary"></i>
            <span class="node-name">{{ node.department_name }}</span>
            <span class="badge bg-secondary ms-2">{{ node.department_code }}</span>
            <span [class]="'badge ms-2 ' + (node.status === 'active' ? 'bg-success' : 'bg-danger')">
              {{ node.status }}
            </span>
          </div>
        </div>

        @if (node.expanded && node.children && node.children.length > 0) {
          <div class="tree-children">
            @for (child of node.children; track child.id) {
              <ng-container *ngTemplateOutlet="treeNode; context: { node: child }"></ng-container>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .department-tree {
        max-height: 600px;
        overflow-y: auto;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        background: #fff;
      }

      .tree-container {
        padding: 16px;
      }

      .tree-item {
        margin-bottom: 4px;
      }

      .tree-node {
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      .tree-node:hover {
        background-color: #f8f9fa;
        border-color: #dee2e6;
      }

      .node-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .node-name {
        font-weight: 500;
        color: #333;
      }

      .tree-children {
        margin-top: 4px;
      }

      .empty-state {
        padding: 40px 20px;
      }

      .badge {
        font-size: 0.75rem;
        padding: 0.35em 0.65em;
      }

      .fa-building {
        color: #0d6efd;
      }

      .opacity-0 {
        opacity: 0;
      }
    `,
  ],
})
export class DepartmentTreeComponent {
  @Input() treeData: DepartmentNode[] = [];
  @Output() nodeSelect = new EventEmitter<DepartmentNode>();

  toggleNode(node: DepartmentNode): void {
    node.expanded = !node.expanded;
    this.nodeSelect.emit(node);
  }
}
