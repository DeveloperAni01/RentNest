import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule],
  template: `
    <p-menubar>
      <ng-template #start>
        <div class="flex items-baseline gap-2">
          <p-button
            icon="pi pi-bars"
            severity="secondary"
            variant="text"
            (click)="toggleSidebar.emit()"
          />
          <span
            class="font-bold text-xl cursor-pointer"
            style="color: var(--primary)"
            (click)="router.navigate(['/'])"
          >
            RentNest
          </span>
        </div>
      </ng-template>
      <ng-template #end>
        <div class="flex gap-2 items-center">
          <span *ngIf="authService.currentUser()" class="text-sm text-gray-600">
            Hello, {{ authService.currentUser()?.fullName }}
          </span>

          <ng-container *ngIf="!isMobile()">
            <p-button
              *ngIf="!authService.currentUser()"
              label="Login"
              (click)="router.navigate(['/login'])"
            />
            <p-button
              *ngIf="!authService.currentUser()"
              label="Register"
              severity="secondary"
              (click)="router.navigate(['/register'])"
            />
            <p-button
              *ngIf="authService.currentUser()"
              label="Logout"
              severity="danger"
              (click)="logout()"
            />
          </ng-container>
        </div>
      </ng-template>
    </p-menubar>
  `,
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    public router: Router,
    public authService: AuthService,
    private messageService: MessageService,
  ) {}

  logout() {
    this.authService.logout();
    this.messageService.add({
      severity: 'warn',
      summary: 'Logged Out',
      detail: 'You have been logged out successfully',
    });
    this.router.navigate(['']);
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
