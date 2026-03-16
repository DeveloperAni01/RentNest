import { Component, OnInit, signal } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { SidebarComponent } from './shared/sidebar/sidebar';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  template: `
    <div class="flex flex-col h-screen">
      <app-navbar (toggleSidebar)="toggleSidebar()" />
      <div
        *ngIf="loading"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.3)"
      >
        <p-progressspinner strokeWidth="4" styleClass="w-16 h-16" />
      </div>

      <div class="flex flex-1 overflow-hidden relative">
        <div
          *ngIf="sidebarVisible && isMobile()"
          class="fixed inset-0 bg-black opacity-40 z-40"
          (click)="sidebarVisible = false"
        ></div>
        <div
          *ngIf="sidebarVisible"
          [class]="isMobile() ? 'fixed top-0 left-0 h-full z-50' : 'relative'"
        >
          <app-sidebar />
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <router-outlet />
        </div>
      </div>
    </div>
    <p-toast />
  `,
})
export class AppComponent implements OnInit {
  sidebarVisible = window.innerWidth >= 768;
  loading = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
        if (window.innerWidth < 768) {
          this.sidebarVisible = false;
        }
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  closeSidebarOnMobile(event: MouseEvent) {
    if (window.innerWidth < 768) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('bg-black')) {
        this.sidebarVisible = false;
      }
    }
  }
}
