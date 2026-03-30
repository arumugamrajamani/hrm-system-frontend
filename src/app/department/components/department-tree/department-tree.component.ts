import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentNode } from '../../models/department.model';

@Component({
  selector: 'app-department-tree',
  standalone: false,
  templateUrl: './department-tree.component.html',
  styleUrls: ['./department-tree.component.scss'],
})
export class DepartmentTreeComponent {
  @Input() treeData: DepartmentNode[] = [];
  @Output() nodeSelect = new EventEmitter<DepartmentNode>();

  get filteredTreeData(): DepartmentNode[] {
    return this.treeData.filter((node) => node.children && node.children.length > 0);
  }

  toggleNode(node: DepartmentNode): void {
    node.expanded = !node.expanded;
    this.nodeSelect.emit(node);
  }
}
