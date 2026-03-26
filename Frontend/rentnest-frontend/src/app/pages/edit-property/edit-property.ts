import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';
import { PropertyService } from '../../core/services/property.service';

@Component({
  selector: 'app-edit-property',
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
    SelectButtonModule,
  ],
  template: `
    <div class="flex justify-center p-4">
      <p-card header="Edit Property" styleClass="w-full max-w-2xl">
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
              <p-inputnumber [(ngModel)]="form.maxGuests" styleClass="w-full" [min]="1" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label>Price Per Night (₹)</label>
            <p-inputnumber [(ngModel)]="form.pricePerNight" styleClass="w-full" [min]="0" />
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
          </div>

          <div class="flex flex-col gap-1">
            <label>Availability</label>
            <p-selectbutton
              [(ngModel)]="form.isAvailable"
              [options]="availabilityOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div class="flex gap-3 justify-end">
            <p-button
              label="Cancel"
              severity="secondary"
              (click)="router.navigate(['/owner/properties'])"
            />
            <p-button label="Save Changes" [loading]="loading" (click)="update()" />
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class EditPropertyComponent implements OnInit {
  loading = false;
  propertyId!: number;

  form = {
    title: '',
    description: '',
    location: '',
    city: '',
    propertyType: null as any,
    pricePerNight: null as any,
    maxGuests: null as any,
    checkInTime: '',
    checkOutTime: '',
    features: '',
    isAvailable: true,
  };

  propertyTypes = [
    { label: 'Flat', value: 0 },
    { label: 'Apartment', value: 1 },
    { label: 'Hotel', value: 2 },
    { label: 'Bungalow', value: 3 },
    { label: 'Villa', value: 4 },
  ];

  availabilityOptions = [
    { label: 'Available', value: true },
    { label: 'Unavailable', value: false },
  ];

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private messageService: MessageService,
    public router: Router,
  ) {}

  ngOnInit() {
    this.propertyId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProperty();
  }

  loadProperty() {
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (res) => {
        if (res.success) {
          const p = res.data;
          this.form = {
            title: p.title,
            description: p.description,
            location: p.location,
            city: p.city,
            propertyType: this.propertyTypes.find((t) => t.label === p.propertyType)?.value ?? 0,
            pricePerNight: p.pricePerNight,
            maxGuests: p.maxGuests,
            checkInTime: p.checkInTime,
            checkOutTime: p.checkOutTime,
            features: p.features,
            isAvailable: p.isAvailable,
          };
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load property',
        });
      },
    });
  }

  update() {
    this.loading = true;
    this.propertyService.updateProperty(this.propertyId, this.form as any).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Property updated successfully!',
          });
          this.router.navigate(['/owner/my-properties']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to update property',
        });
      },
    });
  }
}
