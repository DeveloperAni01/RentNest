import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/apiResponse.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal to track auth state
  currentUser = signal<{ fullName: string; role: string; userId: string } | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Restore from localStorage on app start
    const token = localStorage.getItem('access_token');
    if (token) {
      this.currentUser.set({
        fullName: localStorage.getItem('fullName') || '',
        role: localStorage.getItem('role') || '',
        userId: localStorage.getItem('userId') || '',
      });
    }
  }

  registerUser(data: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signup-user`, data);
  }

  registerOwner(data: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signup-owner`, data);
  }

  verifyOtp(data: VerifyOtpRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/verify-otp`, data);
  }

  resendOtp(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/resend-otp`, { email });
  }

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/signin-user`, data).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('fullName', response.data.fullName);
          localStorage.setItem('userId', response.data.userId);
          this.currentUser.set({
            fullName: response.data.fullName,
            role: response.data.role,
            userId: response.data.userId,
          });
        }
      }),
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refreshtoken`, { refreshToken })
      .pipe(
        tap((response) => {
          if (response.success) {
            localStorage.setItem('access_token', response.data.accessToken);
            localStorage.setItem('refresh_token', response.data.refreshToken);
          }
        }),
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getRole(): string {
    return this.currentUser()?.role || '';
  }

  getFirstName(): string {
    return this.currentUser()?.fullName || '';
  }

  getUserId(): string {
    return this.currentUser()?.userId || '';
  }
}
