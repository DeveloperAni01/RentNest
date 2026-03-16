import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 class="text-6xl font-bold" style="color: var(--primary)">404</h1>
      <p class="text-xl text-gray-500">Oops! Sorry Page not found</p>
      <p class="text-sm text-gray-400">The page you are looking for doesn't exist!!</p>
      <p-button label="Go Home" icon="pi pi-home" (click)="router.navigate(['/'])" />
    </div>
  `,
})
export class NotFoundComponent {
  constructor(public router: Router) {}
}
