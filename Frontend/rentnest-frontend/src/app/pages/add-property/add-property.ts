import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PropertyService } from '../../core/services/property.service';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    FileUploadModule,
  ],
  template: `
    <div class="flex justify-center p-4">
      <p-card header="Create New Property" styleClass="w-full max-w-2xl">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label>Title</label>
            <input
              pInputText
              [(ngModel)]="form.title"
              placeholder="Property title"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label>Description</label>
            <textarea
              pTextarea
              [(ngModel)]="form.description"
              placeholder="Describe your property"
              class="w-full"
              rows="4"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label>Location</label>
              <input
                pInputText
                [(ngModel)]="form.location"
                placeholder="Street / Area"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label>City</label>
              <input pInputText [(ngModel)]="form.city" placeholder="City" class="w-full" />
            </div>
          </div>

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label>Property Type</label>
              <p-select
                [(ngModel)]="form.propertyType"
                [options]="propertyTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Select type"
                styleClass="w-full"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label>Max Guests</label>
              <p-inputnumber
                [(ngModel)]="form.maxGuests"
                placeholder="Max guests"
                styleClass="w-full"
                [min]="1"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label>Price Per Night (₹)</label>
            <p-inputnumber
              [(ngModel)]="form.pricePerNight"
              placeholder="Price per night"
              styleClass="w-full"
              [min]="0"
            />
          </div>

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label>Check In Time</label>
              <input
                pInputText
                [(ngModel)]="form.checkInTime"
                placeholder="e.g. 10:00 AM"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label>Check Out Time</label>
              <input
                pInputText
                [(ngModel)]="form.checkOutTime"
                placeholder="e.g. 11:00 AM"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label>Features</label>
            <input
              pInputText
              [(ngModel)]="form.features"
              placeholder="e.g. WiFi, AC, Parking"
              class="w-full"
            />
            <small class="text-gray-400">Separate features with commas</small>
          </div>

          <div class="flex flex-col gap-1">
            <label>Property Images (max 5)</label>
            <p-fileupload
              name="images[]"
              [multiple]="true"
              accept="image/*"
              [maxFileSize]="10000000"
              [auto]="false"
              chooseLabel="Select Images"
              [showUploadButton]="false"
              [showCancelButton]="false"
              (onSelect)="onFilesSelected($event)"
            >
              <ng-template #empty>
                <div>Drag and drop images here (max 5)</div>
              </ng-template>
            </p-fileupload>
          </div>

          <div class="flex gap-3 justify-end">
            <p-button
              label="Cancel"
              severity="secondary"
              (click)="router.navigate(['/owner/properties'])"
            />
            <p-button label="Create Property" [loading]="loading" (click)="create()" />
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class CreatePropertyComponent {
  loading = false;

  form = {
    title: '',
    description: '',
    location: '',
    city: '',
    propertyType: '',
    pricePerNight: null,
    maxGuests: null,
    checkInTime: '',
    checkOutTime: '',
    features: '',
  };

  propertyTypes = [
    { label: 'Flat', value: 0 },
    { label: 'Apartment', value: 1 },
    { label: 'Hotel', value: 2 },
    { label: 'Bungalow', value: 3 },
    { label: 'Villa', value: 4 },
  ];

  selectedFiles: File[] = [];

  onFilesSelected(event: any) {
    this.selectedFiles = event.currentFiles.slice(0, 5);
  }

  constructor(
    private propertyService: PropertyService,
    private messageService: MessageService,
    public router: Router,
  ) {}

  create() {
    if (
      !this.form.title ||
      !this.form.description ||
      !this.form.location ||
      !this.form.city ||
      !this.form.propertyType ||
      !this.form.pricePerNight ||
      !this.form.maxGuests
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields',
      });
      return;
    }

    this.loading = true;
    this.propertyService.createProperty(this.form as any).subscribe({
      next: (res) => {
            this.loading = false;
            console.log(res);
            
        if (res.success) {
            const propertyId = res.data.propertyId;
            console.log(propertyId);
            
          if (this.selectedFiles.length > 0) {
            this.propertyService.uploadImages(propertyId, this.selectedFiles).subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Property created with images!',
                });
                this.router.navigate(['/owner/properties']);
              },
              error: () => {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Property created but image upload failed',
                });
                this.router.navigate(['/owner/properties']);
              },
            });
          } else {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Property created successfully!',
            });
            this.router.navigate(['/owner/properties']);
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to create property',
        });
      },
    });
  }
}
