import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { Card } from "primeng/card";
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { ReviewService } from '../../core/services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, Card, RatingModule, DialogModule,FormsModule],
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">My Reservations</h2>

      <div *ngIf="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block">
        <p-table
          [value]="reservations"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th>Property</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template #body let-reservation>
            <tr>
              <td>{{ reservation.propertyTitle }}</td>
              <td>{{ reservation.checkInDate | date: 'mediumDate' }}</td>
              <td>{{ reservation.checkOutDate | date: 'mediumDate' }}</td>
              <td>₹{{ reservation.totalAmount }}</td>
              <td>
                <p-tag
                  [value]="reservation.reservationStatus"
                  [severity]="getStatusSeverity(reservation.reservationStatus)"
                />
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    *ngIf="reservation.reservationStatus === 'Pending'"
                    label="Cancel"
                    severity="danger"
                    size="small"
                    (click)="cancelReservation(reservation.reservationId)"
                  />
                  <p-button
                    *ngIf="reservation.reservationStatus === 'Completed'"
                    label="Review"
                    severity="info"
                    size="small"
                    (click)="openReviewDialog(reservation)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #empty>
            <tr>
              <td colspan="6" class="text-center py-8 text-gray-500">No reservations found</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Mobile Cards -->
      <div class="flex flex-col gap-3 md:hidden">
        <p-card *ngFor="let reservation of reservations">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <span class="font-semibold">{{ reservation.propertyTitle }}</span>
              <p-tag
                [value]="reservation.reservationStatus"
                [severity]="getStatusSeverity(reservation.reservationStatus)"
              />
            </div>
            <div class="flex justify-between text-sm text-gray-500">
              <span
                ><i class="pi pi-calendar mr-1"></i
                >{{ reservation.checkInDate | date: 'mediumDate' }}</span
              >
              <span>→</span>
              <span>{{ reservation.checkOutDate | date: 'mediumDate' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-bold" style="color: var(--accent)"
                >₹{{ reservation.totalAmount }}</span
              >
              <div class="flex gap-2">
                <p-button
                  *ngIf="reservation.reservationStatus === 'Pending'"
                  label="Cancel"
                  severity="danger"
                  size="small"
                  (click)="cancelReservation(reservation.reservationId)"
                />
                <p-button
                  *ngIf="reservation.reservationStatus === 'Completed'"
                  label="Review"
                  severity="info"
                  size="small"
                  (click)="openReviewDialog(reservation)"
                />
              </div>
            </div>
          </div>
        </p-card>

        <div *ngIf="!loading && reservations.length === 0" class="text-center py-12 text-gray-500">
          <i class="pi pi-calendar text-5xl mb-4 block"></i>
          <p>No reservations found</p>
        </div>
      </div>

      <!-- Review Dialog -->
      <p-dialog
        header="Rate Your Stay"
        [(visible)]="reviewDialogVisible"
        [modal]="true"
        [style]="{ width: '300px' }"
      >
        <div class="flex flex-col gap-4 items-center py-2">
          <p class="text-gray-600 text-sm">{{ selectedReservation?.propertyTitle }}</p>
          <p-rating [(ngModel)]="rating" />
          <p-button label="Submit Review" styleClass="w-full" (click)="submitReview()" />
        </div>
      </p-dialog>
    </div>
  `,
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;

  constructor(
    private reservationService: ReservationService,
    private messageService: MessageService,
    private reviewService: ReviewService,
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.reservations = res.data;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getStatusSeverity(status: ReservationStatus) {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'Confirmed':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  cancelReservation(reservationId: number) {
    this.reservationService
      .updateReservationStatus({ reservationId, status: 'Cancelled' })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Reservation cancelled',
            });
            this.loadReservations();
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to cancel',
          });
        },
      });
  }

  reviewDialogVisible = false;
  selectedReservation: Reservation | null = null;
  rating = 0;

  openReviewDialog(reservation: Reservation) {
    this.selectedReservation = reservation;
    this.reviewDialogVisible = true;
    this.rating = 0;
  }

  submitReview() {
    if (!this.rating) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a rating',
      });
      return;
    }

    this.reviewService
      .createReview({
        reservationId: this.selectedReservation!.reservationId,
        propertyId: this.selectedReservation!.propertyId,
        rating: this.rating,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Review submitted!',
            });
            this.reviewDialogVisible = false;
            this.loadReservations();
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to submit review',
          });
        },
      });
  }
}
