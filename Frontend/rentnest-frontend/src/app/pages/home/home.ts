import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    RatingModule,
    TagModule,
    SkeletonModule,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl font-bold">Available Properties</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ng-container *ngIf="loading">
          <p-card *ngFor="let i of [1, 2, 3, 4, 5, 6, 7, 8]">
            <p-skeleton height="200px" styleClass="mb-3" />
            <p-skeleton width="70%" styleClass="mb-2" />
            <p-skeleton width="40%" />
          </p-card>
        </ng-container>

        <ng-container *ngIf="!loading">
          <p-card
            *ngFor="let property of properties"
            styleClass="cursor-pointer hover:shadow-lg transition-shadow"
            (click)="goToDetail(property.propertyId)"
          >
            <ng-template #header>
              <img
                *ngIf="property.images.length"
                [src]="getImageUrl(property.images[0])"
                [alt]="property.title"
                class="w-full h-48 object-cover rounded-t-xl"
              />
              <div
                *ngIf="!property.images.length"
                class="w-full h-48 flex items-center justify-center rounded-t-xl"
                style="background: var(--card-bg)"
              >
                <i class="pi pi-image text-4xl text-gray-400"></i>
              </div>
            </ng-template>

            <div class="flex flex-col gap-2">
              <h3 class="font-semibold">{{ property.title }}</h3>
              <div class="flex justify-between items-center">
                <p-tag [value]="property.propertyType" severity="info" />
                <span class="font-bold" style="color: var(--accent)"
                  >₹{{ property.pricePerNight }}/night</span
                >
              </div>
              <span class="text-sm text-gray-500">
                <i class="pi pi-map-marker mr-1"></i>{{ property.city }}
              </span>
              <div class="flex items-center gap-2">
                <p-rating [(ngModel)]="property.rating" [readonly]="true" />
                <span class="text-sm text-gray-500">({{ property.rating }})</span>
              </div>
              <span class="text-sm text-gray-500">
                <i class="pi pi-users mr-1"></i>Max {{ property.maxGuests }} guests
              </span>
            </div>

            <ng-template #footer>
              <p-button
                label="View Details"
                styleClass="w-full"
                (click)="goToDetail(property.propertyId)"
              />
            </ng-template>
          </p-card>
        </ng-container>

        <div
          *ngIf="!loading && properties.length === 0"
          class="col-span-full text-center py-12 text-gray-500"
        >
          <i class="pi pi-home text-5xl mb-4 block"></i>
          <p>No properties found</p>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  loading = false;

  constructor(
    private propertyService: PropertyService,
    public router: Router,
  ) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loading = true;
    this.propertyService.getAllProperties().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.properties = res.data;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getImageUrl(path: string): string {
    return `https://localhost:7016${path}`;
  }

  goToDetail(id: number) {
    this.router.navigate(['/property', id]);
  }
}
