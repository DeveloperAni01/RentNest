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

  currentUser = signal<{ fullName: string; role: string; userId: string; isOwner: string } | null>(
    null,
  );

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (token && refreshToken) {
      this.currentUser.set({
        fullName: localStorage.getItem('fullName') || '',
        role: localStorage.getItem('role') || '',
        userId: localStorage.getItem('userId') || '',
        isOwner: localStorage.getItem('isOwner') || '',
      });
      // fetch fresh data on app start
      this.refreshToken().subscribe();
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
        // console.log(response.data);

        if (response.success) {
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('fullName', response.data.fullName);
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('isOwner', response.data.isOwner);
          this.currentUser.set({
            fullName: response.data.fullName,
            role: response.data.role,
            userId: response.data.userId,
            isOwner: response.data.isOwner,
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
            localStorage.setItem('isOwner', String(response.data.isOwner));
            // ← update signal with fresh isOwner
            this.currentUser.set({
              fullName: response.data.fullName,
              role: response.data.role,
              userId: response.data.userId,
              isOwner: String(response.data.isOwner),
            });
          }
        }),
      );
  }

  logout(): void {
    localStorage.clear();
    this.currentUser.set(null);
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getRole(): string {
    return this.currentUser()?.role || '';
  }

  getOwnerAcess(): string {
    return this.currentUser()?.isOwner || '';
  }

  getFirstName(): string {
    return this.currentUser()?.fullName || '';
  }

  getUserId(): string {
    return this.currentUser()?.userId || '';
  }
}

