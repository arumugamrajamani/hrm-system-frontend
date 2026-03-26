import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: false,
  template: `
    <div class="dropdown-container">
      <div class="dropdown-trigger" (click)="toggle()">
        <ng-content select="[dropdown-trigger]"></ng-content>
      </div>
      @if (isOpen) {
        <div class="dropdown-menu" [class.dropdown-menu-right]="alignRight">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .dropdown-container {
      position: relative;
      display: inline-block;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1000;
      display: block;
      min-width: 180px;
      padding: 8px 0;
      margin: 4px 0 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: dropdownFade 0.2s ease-out;
    }

    .dropdown-menu-right {
      left: auto;
      right: 0;
    }

    @keyframes dropdownFade {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DropdownComponent {
  @Input() alignRight = false;
  @Output() closed = new EventEmitter<void>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}
