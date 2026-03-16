import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/apiResponse.model';
import {
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from '../../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  getAllProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.apiUrl}/all`);
  }

  getPropertyById(id: number): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>(`${this.apiUrl}/${id}`);
  }

  searchProperties(filters: any): Observable<ApiResponse<Property[]>> {
    let params = new HttpParams();
    if (filters.city) params = params.set('city', filters.city);
    if (filters.propertyType) params = params.set('propertyType', filters.propertyType);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    if (filters.maxGuests) params = params.set('maxGuests', filters.maxGuests);
    if (filters.checkInDate) params = params.set('checkInDate', filters.checkInDate);
    if (filters.checkOutDate) params = params.set('checkOutDate', filters.checkOutDate);
    return this.http.get<ApiResponse<Property[]>>(`${this.apiUrl}/search`, { params });
  }

  getMyProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.apiUrl}/my-properties`);
  }

  createProperty(data: CreatePropertyRequest): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(`${this.apiUrl}/create-property`, data);
  }

  updateProperty(id: number, data: UpdatePropertyRequest): Observable<ApiResponse<Property>> {
    return this.http.put<ApiResponse<Property>>(`${this.apiUrl}/${id}`, data);
  }

  deleteProperty(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  uploadImages(id: number, files: File[]): Observable<ApiResponse<any>> {
    const uploads = files.map((file, index) => {
      const formData = new FormData();
      formData.append('image', file);
      return this.http.post<ApiResponse<any>>(
        `${this.apiUrl}/${id}/upload-images?order=${index + 1}`,
        formData,
      );
    });

    return new Observable((observer) => {
      const uploadNext = (i: number) => {
        if (i >= uploads.length) {
          observer.next({ success: true, message: 'All images uploaded', data: null });
          observer.complete();
          return;
        }
        uploads[i].subscribe({
          next: () => uploadNext(i + 1),
          error: (err) => observer.error(err),
        });
      };
      uploadNext(0);
    });
  }
}
