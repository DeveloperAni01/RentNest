import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/apiResponse.model';
import {
  Reservation,
  CreateReservationRequest,
  UpdateReservationStatusRequest,
} from '../../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  createReservation(data: CreateReservationRequest): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}/create`, data);
  }

  getMyReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/my-reservations`);
  }

  getOwnerReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/owner-reservations`);
  }

  getReservationById(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`);
  }

  updateReservationStatus(data: UpdateReservationStatusRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/status`, data);
  }
}
