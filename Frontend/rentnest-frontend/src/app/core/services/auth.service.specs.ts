// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { AuthService } from './auth.service';
// import { environment } from '../../../environments/environment';

// describe('AuthService', () => {
//   let service: AuthService;
//   let httpMock: HttpTestingController;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule, RouterTestingModule],
//       providers: [AuthService],
//     });
//     service = TestBed.inject(AuthService);
//     httpMock = TestBed.inject(HttpTestingController);
//     localStorage.clear();
//   });

//   afterEach(() => {
//     httpMock.verify();
//     localStorage.clear();
//   });

//   // ── isLoggedIn ──
//   it('should return false when no token exists', () => {
//     expect(service.isLoggedIn()).toBeFalse();
//   });

//   it('should return true when token exists in localStorage', () => {
//     localStorage.setItem('access_token', 'fake-token');
//     service.currentUser.set({ fullName: 'Test User', role: 'Renter', userId: '123' });
//     expect(service.isLoggedIn()).toBeTrue();
//   });

//   // ── getRole ──
//   it('should return empty string when not logged in', () => {
//     expect(service.getRole()).toBe('');
//   });

//   it('should return correct role when logged in', () => {
//     service.currentUser.set({ fullName: 'Test', role: 'Owner', userId: '123' });
//     expect(service.getRole()).toBe('Owner');
//   });

//   // ── getFirstName ──
//   it('should return empty string when not logged in', () => {
//     expect(service.getFirstName()).toBe('');
//   });

//   it('should return fullName when logged in', () => {
//     service.currentUser.set({ fullName: 'Anirban Mondal', role: 'Renter', userId: '123' });
//     expect(service.getFirstName()).toBe('Anirban Mondal');
//   });

//   // ── login ──
//   it('should store tokens in localStorage on successful login', () => {
//     const mockResponse = {
//       success: true,
//       statusCode: 200,
//       message: 'Login successful',
//       data: {
//         accessToken: 'fake-access-token',
//         refreshToken: 'fake-refresh-token',
//         role: 'Renter',
//         fullName: 'Anirban Mondal',
//         userId: 'USR-001',
//         expiresAt: '',
//         message: '',
//       },
//     };

//     service.login({ email: 'test@test.com', password: '123456' }).subscribe((res) => {
//       expect(res.success).toBeTrue();
//       expect(localStorage.getItem('access_token')).toBe('fake-access-token');
//       expect(localStorage.getItem('refresh_token')).toBe('fake-refresh-token');
//       expect(localStorage.getItem('role')).toBe('Renter');
//       expect(localStorage.getItem('fullName')).toBe('Anirban Mondal');
//     });

//     const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin-user`);
//     expect(req.request.method).toBe('POST');
//     req.flush(mockResponse);
//   });

//   // ── logout ──
//   it('should clear localStorage on logout', () => {
//     localStorage.setItem('access_token', 'fake-token');
//     service.currentUser.set({ fullName: 'Test', role: 'Renter', userId: '123' });
//     service.logout();
//     expect(localStorage.getItem('access_token')).toBeNull();
//     expect(service.isLoggedIn()).toBeFalse();
//   });

//   // ── register ──
//   it('should call signup-user endpoint for renter registration', () => {
//     const mockData = {
//       firstName: 'Anirban',
//       lastName: 'Mondal',
//       email: 'test@test.com',
//       password: '123456',
//       confirmPassword: '123456',
//       gender: 'Male',
//       phoneNumber: '1234567890',
//     };

//     service.registerUser(mockData).subscribe();

//     const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup-user`);
//     expect(req.request.method).toBe('POST');
//     req.flush({ success: true });
//   });

//   it('should call signup-owner endpoint for owner registration', () => {
//     const mockData = {
//       firstName: 'Owner',
//       lastName: 'Test',
//       email: 'owner@test.com',
//       password: '123456',
//       confirmPassword: '123456',
//       gender: 'Male',
//       phoneNumber: '1234567890',
//     };

//     service.registerOwner(mockData).subscribe();

//     const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup-owner`);
//     expect(req.request.method).toBe('POST');
//     req.flush({ success: true });
//   });
// });
