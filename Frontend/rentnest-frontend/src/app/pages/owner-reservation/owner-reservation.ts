import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';

@Component({
  selector: 'app-owner-reservations',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">Property Reservations</h2>

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
            <th>Renter</th>
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
            <td>{{ reservation.renterName }}</td>
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
                  label="Confirm"
                  severity="success"
                  size="small"
                  (click)="updateStatus(reservation.reservationId, 'Confirmed')"
                />
                <p-button
                  *ngIf="
                    reservation.reservationStatus === 'Pending' ||
                    reservation.reservationStatus === 'Confirmed'
                  "
                  label="Cancel"
                  severity="danger"
                  size="small"
                  (click)="updateStatus(reservation.reservationId, 'Cancelled')"
                />
                <p-button
                  *ngIf="reservation.reservationStatus === 'Confirmed'"
                  label="Complete"
                  severity="info"
                  size="small"
                  (click)="updateStatus(reservation.reservationId, 'Completed')"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          <tr>
            <td colspan="7" class="text-center py-8 text-gray-500">No reservations found</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class OwnerReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;

  constructor(
    private reservationService: ReservationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.reservationService.getOwnerReservations().subscribe({
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

  updateStatus(reservationId: number, status: ReservationStatus) {
    this.reservationService
      .updateReservationStatus({ reservationId, status: status })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Reservation ${status}`,
            });
            this.loadReservations();
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to update status',
          });
        },
      });
  }
}
