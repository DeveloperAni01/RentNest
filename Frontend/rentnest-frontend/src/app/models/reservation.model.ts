export type ReservationStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Reservation {
  reservationId: number;
  userId: string;
  propertyId: number;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  reservationStatus: ReservationStatus;
  paymentStatus: string;
  bookedAt: string;
}

export interface CreateReservationRequest {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface UpdateReservationStatusRequest {
  reservationId: number;
  status: ReservationStatus;
}
