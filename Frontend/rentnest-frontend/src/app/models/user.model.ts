export interface User {
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  role: 'SuperAdmin' | 'Owner' | 'Renter';
  isOwner: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  fullName: string;
  userId: string;
  expiresAt: string;
  message: string;
}