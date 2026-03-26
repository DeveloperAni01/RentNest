import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { RatingModule } from 'primeng/rating';
import { MessageService } from 'primeng/api';
import { PropertyService } from '../../core/services/property.service';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Property } from '../../models/property.model';
import { DatePickerModule } from 'primeng/datepicker';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    GalleriaModule,
    DatePickerModule,
    DividerModule,
    RatingModule,
  ],
  template: `
    <div class="flex flex-col gap-6 max-w-4xl mx-auto" *ngIf="property">
      <p-galleria
        [value]="images"
        [numVisible]="5"
        [circular]="true"
        [showItemNavigators]="true"
        [showThumbnails]="true"
        styleClass="w-full"
      >
        <ng-template #item let-item>
          <img [src]="item" class="w-full h-96 object-cover rounded-xl" />
        </ng-template>
        <ng-template #thumbnail let-item>
          <img [src]="item" class="w-16 h-12 object-cover" />
        </ng-template>
      </p-galleria>

      <div class="flex flex-col lg:flex-row gap-6">
        <div class="flex flex-col gap-4 flex-1">
          <div class="flex justify-between items-start">
            <h1 class="text-2xl font-bold">{{ property.title }}</h1>

            <p-tag [value]="property.propertyType" severity="info" />
          </div>

          <div class="flex items-center gap-2">
            <p-rating [(ngModel)]="property.rating" [readonly]="true" />
            <span class="text-sm text-gray-500">({{ property.rating }})</span>
          </div>

          <div class="flex flex-col gap-4 text-sm text-gray-600 items-start">
            <div class="flex  gap-4 text-sm text-gray-600">
              <span
                ><i class="pi pi-map-marker mr-1"></i>{{ property.location }},
                {{ property.city }}</span
              >
              <span><i class="pi pi-users mr-1"></i>Max {{ property.maxGuests }} guests</span>
            </div>
            <span
              ><h1 class="text-lg font-mono">Owner Name : {{ property.ownerName }}</h1></span
            >
          </div>

          <p-divider />

          <p class="text-gray-700">{{ property.description }}</p>

          <p-divider />

          <div>
            <h3 class="font-semibold mb-2">Features</h3>
            <div class="flex flex-wrap gap-2">
              <p-tag *ngFor="let feature of featureList" [value]="feature" severity="secondary" />
            </div>
          </div>

          <p-divider />

          <!-- Reviews -->
          <div>
            <h3 class="font-semibold mb-3">Reviews ({{ reviews.length }})</h3>
            <div *ngIf="reviews.length === 0" class="text-sm text-gray-500">No reviews yet</div>
            <div class="flex flex-col gap-3">
              <p-card *ngFor="let review of reviews" styleClass="w-full">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-sm">{{ review.renterName || 'Anonymous' }}</span>
                  <span class="text-xs text-gray-400">{{
                    review.createdAt | date: 'mediumDate'
                  }}</span>
                </div>
                <p-rating [(ngModel)]="review.rating" [readonly]="true" styleClass="mt-2" />
              </p-card>
            </div>
          </div>

          <p-divider />

          <div class="flex gap-6 text-sm">
            <span><i class="pi pi-clock mr-1"></i>Check In: {{ property.checkInTime }}</span>
            <span><i class="pi pi-clock mr-1"></i>Check Out: {{ property.checkOutTime }}</span>
          </div>
        </div>

        <div class="w-full lg:w-80">
          <p-card>
            <div class="flex flex-col gap-4">
              <div class="text-2xl font-bold" style="color: var(--accent)">
                ₹{{ property.pricePerNight
                }}<span class="text-sm font-normal text-gray-500">/night</span>
              </div>

              <ng-container *ngIf="isRenter">
                <div class="flex flex-col gap-1">
                  <label>Check In Date</label>
                  <p-date-picker
                    [(ngModel)]="checkInDate"
                    [minDate]="today"
                    dateFormat="yy-mm-dd"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label>Check Out Date</label>
                  <p-date-picker
                    [(ngModel)]="checkOutDate"
                    [minDate]="checkInDate || today"
                    dateFormat="yy-mm-dd"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                  />
                </div>

                <div *ngIf="totalAmount > 0" class="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span style="color: var(--accent)">₹{{ totalAmount }}</span>
                </div>

                <p-button
                  label="Book Now"
                  styleClass="w-full"
                  styleClass="w-full"
                  [loading]="loading"
                  (click)="book()"
                />
              </ng-container>

              <!-- Contact Owner Button -->
              <ng-container *ngIf="isLoggedIn && !isOwner">
                <p-divider />
                <p-button
                  label="Contact Owner"
                  icon="pi pi-comments"
                  severity="secondary"
                  styleClass="w-full"
                  (click)="contactOwner()"
                />
              </ng-container>

              <ng-container *ngIf="!isRenter && !isLoggedIn">
                <p class="text-sm text-gray-500 text-center">Please login as Renter to book</p>
                <p-button
                  label="Login to Book"
                  styleClass="w-full"
                  (click)="router.navigate(['/login'])"
                />
              </ng-container>

              <ng-container *ngIf="isOwner">
                <p class="text-sm text-gray-500 text-center">You cannot book as an Owner</p>
              </ng-container>
            </div>
          </p-card>
        </div>
      </div>
    </div>

    <div *ngIf="!property" class="text-center py-12 text-gray-500">
      <i class="pi pi-spin pi-spinner text-4xl"></i>
    </div>
  `,
})
export class PropertyDetailComponent implements OnInit {
  property: Property | null = null;
  images: string[] = [];
  reviews: Review[] = [];
  featureList: string[] = [];
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  today = new Date();
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private messageService: MessageService,
    public router: Router,
    private reviewService: ReviewService,
  ) {}

  loadReviews(propertyId: number) {
    this.reviewService.getPropertyReviews(propertyId).subscribe({
      next: (res) => {
        if (res.success) this.reviews = res.data;
      },
      error: () => {},
    });
  }

  contactOwner() {
    if (this.property) {
      this.router.navigate(['/messages'], {
        queryParams: {
          userId: this.property.ownerId,
          userName: this.property.ownerName,
        },
      });
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isRenter(): boolean {
    return this.authService.currentUser()?.role === 'Renter';
  }

  get isOwner(): boolean {
    return this.authService.currentUser()?.role === 'Owner';
  }

  get totalAmount(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const nights = Math.ceil(
      (this.checkOutDate.getTime() - this.checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return nights > 0 ? nights * (this.property?.pricePerNight || 0) : 0;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProperty(id);
    this.loadReviews(id);
  }

  loadProperty(id: number) {
    this.propertyService.getPropertyById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.property = res.data;
          this.images = res.data.images.map((img: string) => `https://localhost:7016${img}`);
          this.featureList = res.data.features.split(',').map((f: string) => f.trim());
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

  book() {
    if (!this.checkInDate || !this.checkOutDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select check in and check out dates',
      });
      return;
    }

    this.loading = true;
    const request = {
      propertyId: this.property!.propertyId,
      checkInDate: this.checkInDate.toISOString().split('T')[0],
      checkOutDate: this.checkOutDate.toISOString().split('T')[0],
    };

    this.reservationService.createReservation(request).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Reservation created successfully!',
          });
          this.router.navigate(['/my-reservations']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to create reservation',
        });
      },
    });
  }
}
