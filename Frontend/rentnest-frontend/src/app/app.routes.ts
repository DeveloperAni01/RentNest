import { Routes } from '@angular/router';
import { publicGuard } from './core/guards/public.guard';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./pages/otp-verification/otp-verification').then((m) => m.VerifyOtpComponent),
    canActivate: [publicGuard],
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'all-properties',
    loadComponent: () => import('./pages/properties/properties').then((m) => m.PropertiesComponent),
  },
  {
    path: 'owner/properties/create',
    loadComponent: () =>
      import('./pages/add-property/add-property').then((m) => m.CreatePropertyComponent),
    canActivate: [authGuard, roleGuard(['Owner'])],
  },
  {
    path: 'owner/my-properties',
    loadComponent: () =>
      import('./pages/owner-properties/owner-properties').then((m) => m.OwnerPropertiesComponent),
    canActivate: [authGuard, roleGuard(['Owner'])],
  },
  {
    path: 'owner/properties/edit/:id',
    loadComponent: () =>
      import('./pages/edit-property/edit-property').then((m) => m.EditPropertyComponent),
    canActivate: [authGuard, roleGuard(['Owner'])],
  },
  {
    path: 'owner/reservations',
    loadComponent: () =>
      import('./pages/owner-reservation/owner-reservation').then(
        (m) => m.OwnerReservationsComponent,
      ),
    canActivate: [authGuard, roleGuard(['Owner'])],
  },
  {
    path: 'my-reservations',
    loadComponent: () =>
      import('./pages/renter-reservation/renter-reservation').then(
        (m) => m.MyReservationsComponent,
      ),
    canActivate: [authGuard, roleGuard(['Renter'])],
  },
  {
    path: 'property/:id',
    loadComponent: () =>
      import('./pages/property-details/property-details').then((m) => m.PropertyDetailComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/super-admin/super-admin').then((m) => m.AdminComponent),
    canActivate: [authGuard, roleGuard(['SuperAdmin'])],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
