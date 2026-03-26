import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, ButtonModule, DividerModule],
  template: `
    <div
      class="h-full flex flex-col p-3"
      style="background: var(--card-bg); border-right: 1px solid var(--border); width: 250px;"
    >
      <div class="flex-1">
        <p-panelmenu [model]="items" styleClass="w-full" />
      </div>

      <ng-container *ngIf="isMobile()">
        <p-divider />
        <div class="flex flex-col gap-2 pb-2">
          <ng-container *ngIf="!authService.currentUser()">
            <p-button label="Login" styleClass="w-full" (click)="navigate('/login')" />
            <p-button
              label="Register"
              severity="secondary"
              styleClass="w-full"
              (click)="navigate('/register')"
            />
          </ng-container>
          <p-button
            *ngIf="authService.currentUser()"
            label="Logout"
            severity="danger"
            styleClass="w-full"
            (click)="logout()"
          />
        </div>
      </ng-container>
    </div>
  `,
})
export class SidebarComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  get items(): MenuItem[] {
    const role = this.authService.currentUser()?.role;

    const common: MenuItem[] = [
      { label: 'Home', icon: 'pi pi-home', command: () => this.navigate('/') },
      {
        label: 'Properties',
        icon: 'pi pi-building',
        command: () => this.navigate('/all-properties'),
      },
    ];

    if (role === 'Owner') {
      const isOwner = this.authService.currentUser()?.isOwner === 'true';

      return [
        ...common,
        {
          label: 'My Properties',
          icon: 'pi pi-list',
          command: () => this.handleOwnerNav('/owner/my-properties', isOwner),
        },
        {
          label: 'Create Property',
          icon: 'pi pi-plus',
          command: () => this.handleOwnerNav('/owner/properties/create', isOwner),
        },
        {
          label: 'Reservations',
          icon: 'pi pi-calendar',
          command: () => this.handleOwnerNav('/owner/reservations', isOwner),
        },
        {
          label: 'Messages',
          icon: 'pi pi-comments',
          command: () => this.handleOwnerNav('/messages', isOwner),
        },
      ];
    } else if (role === 'Renter') {
      return [
        ...common,
        {
          label: 'My Reservations',
          icon: 'pi pi-calendar',
          command: () => this.navigate('/my-reservations'),
        },
        { label: 'My Reviews', icon: 'pi pi-star', command: () => this.navigate('/my-reviews') },
        { label: 'Messages', icon: 'pi pi-comments', command: () => this.navigate('/messages') },
      ];
    } else if (role === 'SuperAdmin') {
      return [
        { label: 'Home', icon: 'pi pi-home', command: () => this.navigate('/') },
        { label: 'Manage Owners', icon: 'pi pi-users', command: () => this.navigate('/admin') },
      ];
    }

    return common;
  }

  handleOwnerNav(path: string, isOwner: boolean) {
    if (!isOwner) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Approved',
        detail: 'Your account is pending admin approval',
      });
      return;
    }
    this.navigate(path);
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
  }
}

