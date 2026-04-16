import {
  Component,
  inject,
  HostListener,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CommandPaletteService, Command } from '../../../core/services/command-palette.service';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatRippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (commandPalette.isOpen()) {
      <div class="command-overlay" (click)="close()" [@fadeIn]>
        <div
          class="command-dialog"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div class="command-header">
            <mat-icon>search</mat-icon>
            <input
              #searchInput
              type="text"
              class="command-input"
              placeholder="Type a command or search..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
              aria-label="Search commands"
            />
            <kbd class="shortcut-hint">ESC</kbd>
          </div>

          <div class="command-content">
            @if (getCategorizedCommands().length === 0) {
              <div class="no-results">
                <mat-icon>search_off</mat-icon>
                <p>No commands found</p>
              </div>
            } @else {
              @for (category of getCategorizedCommands(); track category.name) {
                <div class="command-category">
                  <div class="category-header">{{ category.name }}</div>
                  @for (command of category.commands; track command.id; let i = $index) {
                    <button
                      class="command-item"
                      [class.selected]="selectedIndex === getGlobalIndex(category.name, i)"
                      [disabled]="command.disabled"
                      (click)="executeCommand(command)"
                      (mouseenter)="selectedIndex = getGlobalIndex(category.name, i)"
                      matRipple
                    >
                      @if (command.icon) {
                        <mat-icon class="command-icon">{{ command.icon }}</mat-icon>
                      }
                      <div class="command-text">
                        <span class="command-label">{{ command.label }}</span>
                        @if (command.description) {
                          <span class="command-description">{{ command.description }}</span>
                        }
                      </div>
                      @if (command.shortcut) {
                        <kbd class="command-shortcut">{{ command.shortcut }}</kbd>
                      }
                    </button>
                  }
                </div>
              }
            }
          </div>

          <div class="command-footer">
            <div class="footer-hint">
              <kbd>↑↓</kbd> to navigate <kbd>Enter</kbd> to select <kbd>Esc</kbd> to close
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .command-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
        z-index: 9999;
        animation: fadeIn 0.15s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .command-dialog {
        width: 100%;
        max-width: 600px;
        background: var(--card-bg, #ffffff);
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        animation: slideDown 0.2s ease;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .command-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
      }

      .command-header mat-icon {
        color: var(--text-secondary, #757575);
        flex-shrink: 0;
      }

      .command-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 16px;
        color: var(--text-primary, #212121);
        outline: none;
      }

      .command-input::placeholder {
        color: var(--text-muted, #9e9e9e);
      }

      .shortcut-hint {
        background: var(--bg-secondary, #f5f5f5);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        color: var(--text-secondary, #757575);
        border: 1px solid var(--border-color, #e0e0e0);
      }

      .command-content {
        max-height: 400px;
        overflow-y: auto;
        padding: 8px 0;
      }

      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
        color: var(--text-secondary, #757575);
      }

      .no-results mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .command-category {
        padding: 8px 0;
      }

      .category-header {
        padding: 8px 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary, #757575);
      }

      .command-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 20px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        transition: background 0.1s ease;
      }

      .command-item:hover,
      .command-item.selected {
        background: var(--hover-bg, rgba(0, 0, 0, 0.04));
      }

      .command-item.selected {
        background: var(--primary-color, #3f51b5);
        color: white;
      }

      .command-item.selected .command-description,
      .command-item.selected .command-icon {
        color: rgba(255, 255, 255, 0.8);
      }

      .command-item:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .command-icon {
        color: var(--text-secondary, #757575);
        flex-shrink: 0;
      }

      .command-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .command-label {
        font-size: 14px;
        font-weight: 500;
      }

      .command-description {
        font-size: 12px;
        color: var(--text-secondary, #757575);
      }

      .command-shortcut {
        background: var(--bg-secondary, #f5f5f5);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        color: var(--text-secondary, #757575);
        border: 1px solid var(--border-color, #e0e0e0);
      }

      .command-footer {
        padding: 12px 20px;
        border-top: 1px solid var(--border-color, #e0e0e0);
        background: var(--bg-secondary, #f5f5f5);
      }

      .footer-hint {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--text-secondary, #757575);
      }

      .footer-hint kbd {
        background: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-right: 4px;
        border: 1px solid var(--border-color, #e0e0e0);
      }
    `,
  ],
})
export class CommandPaletteComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  commandPalette = inject(CommandPaletteService);
  private router = inject(Router);

  searchQuery = '';
  selectedIndex = 0;

  ngAfterViewInit(): void {
    if (this.searchInput) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 0);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.commandPalette.isOpen()) return;

    const categorizedCommands = this.getCategorizedCommands();
    const totalCommands = categorizedCommands.reduce((sum, cat) => sum + cat.commands.length, 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % totalCommands;
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + totalCommands) % totalCommands;
        break;
      case 'Enter':
        event.preventDefault();
        const command = this.getCommandAtIndex(this.selectedIndex);
        if (command) {
          this.executeCommand(command);
        }
        break;
    }
  }

  onSearch(query: string): void {
    this.commandPalette.search(query);
    this.selectedIndex = 0;
  }

  getCategorizedCommands() {
    return this.commandPalette.getCategorizedCommands();
  }

  getGlobalIndex(categoryName: string, indexInCategory: number): number {
    const categories = this.getCategorizedCommands();
    let globalIndex = 0;
    for (const category of categories) {
      if (category.name === categoryName) {
        return globalIndex + indexInCategory;
      }
      globalIndex += category.commands.length;
    }
    return 0;
  }

  getCommandAtIndex(index: number): Command | null {
    const categories = this.getCategorizedCommands();
    let currentIndex = 0;
    for (const category of categories) {
      for (const command of category.commands) {
        if (currentIndex === index) {
          return command;
        }
        currentIndex++;
      }
    }
    return null;
  }

  executeCommand(command: Command): void {
    this.commandPalette.executeCommand(command);
  }

  close(): void {
    this.commandPalette.close();
  }
}
