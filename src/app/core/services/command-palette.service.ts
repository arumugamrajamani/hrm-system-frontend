import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  action: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

export interface CommandCategory {
  name: string;
  commands: Command[];
}

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly commands = signal<Command[]>([]);

  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupKeyboardShortcut();
    }
  }

  private setupKeyboardShortcut(): void {
    if (typeof window === 'undefined') return;

    this.keydownHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }

      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  registerCommands(commands: Command[]): void {
    this.commands.set(commands);
  }

  addCommand(command: Command): void {
    this.commands.update((cmds) => [...cmds, command]);
  }

  removeCommand(id: string): void {
    this.commands.update((cmds) => cmds.filter((c) => c.id !== id));
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.searchQuery.set('');
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  search(query: string): void {
    this.searchQuery.set(query);
  }

  executeCommand(command: Command): void {
    if (command.disabled) return;
    this.close();
    command.action();
  }

  getFilteredCommands(): Command[] {
    const query = this.searchQuery().toLowerCase().trim();
    const cmds = this.commands();

    if (!query) return cmds.filter((c) => !c.hidden);

    return cmds
      .filter((c) => !c.hidden)
      .filter(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.category?.toLowerCase().includes(query),
      );
  }

  getCategorizedCommands(): CommandCategory[] {
    const filtered = this.getFilteredCommands();
    const categories = new Map<string, Command[]>();

    filtered.forEach((cmd) => {
      const category = cmd.category || 'General';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(cmd);
    });

    return Array.from(categories.entries()).map(([name, commands]) => ({
      name,
      commands,
    }));
  }

  ngOnDestroy(): void {
    if (this.keydownHandler && typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }
}
