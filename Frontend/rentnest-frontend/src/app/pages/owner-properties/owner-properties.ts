import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-owner-properties',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">My Properties</h2>
        <p-button
          label="Add Property"
          icon="pi pi-plus"
          (click)="router.navigate(['/owner/properties/create'])"
        />
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12 text-gray-500">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
      </div>

      <!-- No Properties -->
      <div *ngIf="!loading && properties.length === 0" class="text-center py-12 text-gray-500">
        <i class="pi pi-building text-5xl mb-4 block"></i>
        <p>No properties yet</p>
        <p-button
          label="Create First Property"
          icon="pi pi-plus"
          styleClass="mt-3"
          (click)="router.navigate(['/owner/properties/create'])"
        />
      </div>

      <!-- Properties Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <p-card *ngFor="let property of properties" [header]="property.title">
          <!-- Image -->
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
            <div class="flex justify-between items-center">
              <p-tag [value]="property.propertyType" severity="info" />
              <p-tag
                [value]="property.isAvailable ? 'Available' : 'Unavailable'"
                [severity]="property.isAvailable ? 'success' : 'danger'"
              />
            </div>
            <span class="font-bold" style="color: var(--accent)"
              >₹{{ property.pricePerNight }}/night</span
            >
            <span class="text-sm text-gray-500">
              <i class="pi pi-map-marker mr-1"></i>{{ property.city }}
            </span>
            <span class="text-sm text-gray-500">
              <i class="pi pi-users mr-1"></i>Max {{ property.maxGuests }} guests
            </span>
          </div>

          <ng-template #footer>
            <div class="flex gap-2">
              <p-button
                label="Edit"
                icon="pi pi-pencil"
                severity="secondary"
                styleClass="flex-1"
                (click)="router.navigate(['/owner/properties/edit', property.propertyId])"
              />
              <p-button
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                styleClass="flex-1"
                (click)="confirmDelete(property)"
              />
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>

    <p-confirmdialog />
  `,
})
export class OwnerPropertiesComponent implements OnInit {
  properties: Property[] = [];
  loading = false;

  constructor(
    private propertyService: PropertyService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public router: Router,
  ) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loading = true;
    this.propertyService.getMyProperties().subscribe({
      next: (res) => {
        this.loading = false;
        console.log(res.data);

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

  confirmDelete(property: Property) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${property.title}"?`,
      header: 'Delete Property',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProperty(property.propertyId);
      },
    });
  }

  deleteProperty(id: number) {
    this.propertyService.deleteProperty(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Property deleted successfully',
          });
          this.loadProperties();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to delete',
        });
      },
    });
  }
}
