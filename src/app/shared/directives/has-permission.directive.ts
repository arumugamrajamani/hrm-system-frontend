import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
} from '@angular/core';
import { RbacService } from '../../core/services/rbac.service';
import { PermissionAction, Role } from '../../core/models/rbac.models';

@Directive({
  selector: '[appHasPermission]',
  standalone: false,
})
export class HasPermissionDirective {
  @Input('appHasPermission') set permission(
    value: PermissionAction | PermissionAction[] | string | string[] | null,
  ) {
    this._permission = value;
    this.render();
  }

  @Input() appHasPermissionElse?: TemplateRef<unknown>;

  @Input() set appHasPermissionRoles(roles: Role | Role[]) {
    this._roles = Array.isArray(roles) ? roles : [roles];
    this.render();
  }

  private _permission?: PermissionAction | PermissionAction[] | string | string[] | null;
  private _roles?: Role[];
  private _hasView = false;
  private _showingElse = false;
  private readonly rbacService = inject(RbacService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
 
  constructor() {
    effect(() => {
      this.rbacService.currentRole();
      this.rbacService.currentPermissions();
      this.render();
    });
  }

  private render(): void {
    const hasPermission = this.checkPermission();
    const hasRole = this.checkRole();
    const shouldShow = hasPermission && hasRole;

    if (shouldShow) {
      if (!this._hasView || this._showingElse) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this._hasView = true;
        this._showingElse = false;
      }
      return;
    }

    if (this.appHasPermissionElse) {
      if (!this._hasView || !this._showingElse) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
        this._hasView = true;
        this._showingElse = true;
      }
      return;
    }

    if (this._hasView) {
      this.viewContainer.clear();
      this._hasView = false;
      this._showingElse = false;
    }
  }

  private checkPermission(): boolean {
    if (!this._permission) return true;

    if (Array.isArray(this._permission)) {
      return this.rbacService.hasAnyPermission(this._permission as PermissionAction[]);
    }

    return this.rbacService.hasPermission(this._permission as PermissionAction);
  }

  private checkRole(): boolean {
    if (!this._roles?.length) return true;
    return this.rbacService.hasAnyRole(this._roles);
  }
}

@Directive({
  selector: '[appHasRole]',
  standalone: false,
})
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') set roles(value: Role | Role[]) {
    this._roles = value;
    this.render();
  }

  @Input() appHasRoleElse?: TemplateRef<unknown>;

  private _roles!: Role | Role[];
  private _hasView = false;
  private _showingElse = false;
  private readonly rbacService = inject(RbacService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
 
  constructor() {
    effect(() => {
      this.rbacService.currentRole();
      this.render();
    });
  }

  ngOnInit(): void {
    this.render();
  }

  private render(): void {
    const hasRole = this.rbacService.hasAnyRole(this._roles);

    if (hasRole) {
      if (!this._hasView || this._showingElse) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this._hasView = true;
        this._showingElse = false;
      }
      return;
    }

    if (this.appHasRoleElse) {
      if (!this._hasView || !this._showingElse) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.appHasRoleElse);
        this._hasView = true;
        this._showingElse = true;
      }
      return;
    }

    if (this._hasView) {
      this.viewContainer.clear();
      this._hasView = false;
      this._showingElse = false;
    }
  }
}
