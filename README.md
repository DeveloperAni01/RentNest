#RentNest

> **A full-stack property rental platform** — connecting property owners and renters through a secure, modern web application.

## 🌟 Overview

**RentNest** is a production-ready property rental platform that allows:
- **Renters** to browse, search, and book properties
- **Owners** to list, manage, and track their properties and reservations
- **Super Admins** to oversee the entire platform

Built with a clean **N-Layer Architecture** on the backend and a reactive **Angular 21** frontend, secured with **JWT authentication**, **OTP email verification**, and **role-based access control**.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration with **email OTP verification**
- JWT access tokens (60-min expiry) + refresh token mechanism
- Role-based route guards (Renter / Owner / SuperAdmin)
- Auto session restore on page reload
- Secure logout (clears all tokens)

### 🏘️ Property Management
- Browse all available properties
- Advanced search & filtering
- Property image uploads (multiple images per property)
- Owners can add, edit, and manage their listings
- Detailed property pages with amenities

### 📅 Reservation System
- Renters can make reservations with date selection
- Conflict detection (no double bookings)
- Owners can approve/reject reservations
- Full reservation history for both roles

### 👤 User Roles
- **Renter** — Browse, search, reserve properties
- **Owner** — List properties, manage reservations
- **SuperAdmin** — Platform oversight, user management

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **.NET 10 / ASP.NET Core** | Web API framework |
| **Entity Framework Core** | ORM & database access |
| **SQL Server** | Relational database |
| **JWT Bearer** | Token-based authentication |
| **BCrypt** | Password hashing |
| **SMTP (MailKit)** | OTP email delivery |
| **xUnit** | Backend unit testing |

### Frontend
| Technology | Purpose |
|---|---|
| **Angular 21** | For Frontend development |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Angular Signals** | Reactive state management |
| **HTTP Interceptors** | Auto-attach JWT to requests |
| **Vitest** | Frontend unit & E2E testing |
| **Route Guards** | Role-based navigation protection |


## 📁 Project Structure

```
RentNest/
│
├── Backend/
│   └── RentNest/
│       ├── RentNest.API/                  # Controllers, Middleware, Program.cs
│       │   ├── Controllers/
│       │   │   ├── AuthController.cs      # Register, Login, OTP, Refresh
│       │   │   ├── PropertyController.cs  # CRUD for properties
│       │   │   ├── ReservationController.cs
│       │   │   └── AdminController.cs
│       │   ├── wwwroot/images/            # Uploaded property images
│       │   └── Program.cs                 # JWT config, DI, middleware
│       │
│       ├── RentNest.Application/          # Business logic, DTOs, Interfaces
│       ├── RentNest.Domain/               # Entities (User, Property, Reservation)
│       ├── RentNest.Infrastructure/       # EF Core, Repos, TokenService, Email
│       └── RentNest.Tests/                # xUnit backend tests (8 passing)
│
├── Frontend/
│   └── rentnest-frontend/
│       ├── src/app/
│       │   ├── core/
│       │   │   ├── guards/                # auth.guard, role.guard, public.guard
│       │   │   ├── interceptors/          # auth.interceptor, refresh.interceptor
│       │   │   └── services/              # auth.service, property.service, etc.
│       │   ├── models/                    # TypeScript interfaces
│       │   ├── pages/
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   ├── home/
│       │   │   ├── properties/
│       │   │   ├── property-details/
│       │   │   ├── add-property/
│       │   │   ├── edit-property/
│       │   │   ├── owner-properties/
│       │   │   ├── owner-reservation/
│       │   │   ├── renter-reservation/
│       │   │   ├── super-admin/
│       │   │   └── otp-verification/
│       │   └── shared/
│       │       ├── navbar/
│       │       └── sidebar/
│       └── src/app/core/criteria.spec.ts  # 62+ frontend tests
│
└── Docs/
    └── rentnest-technical-docs.html       # Full technical documentation
```


## 🔐 Authentication Flow

```
1. REGISTRATION
   User fills form → POST /register → Email OTP sent
        ↓
2. OTP VERIFICATION
   User enters OTP → POST /verify-otp → Account activated
        ↓
3. LOGIN
   POST /login → Returns { accessToken, refreshToken, role }
        ↓
4. AUTHENTICATED REQUESTS
   Every API call → Auth Interceptor adds:
   Header: Authorization: Bearer <accessToken>
        ↓
5. TOKEN REFRESH (Auto)
   Token expires → Interceptor catches 401
   → POST /refresh → New accessToken stored
   → Original request retried automatically
        ↓
6. LOGOUT
   POST /logout → localStorage cleared → Redirect to login
```

---

## 👥 User Roles

### 🏠 Renter
- Browse and search all available properties
- View detailed property information & images
- Make reservation requests with date selection
- Track reservation status (Pending / Approved / Rejected)
- View full booking history

### 🔑 Owner
- List new properties with images & amenities
- Edit and manage existing listings
- View all incoming reservation requests
- Approve or reject reservation requests
- Dashboard with property & booking overview

### ⚙️ SuperAdmin
- View all users on the platform
- Manage platform-wide settings
- Access all properties and reservations
- User role management

---

## 🗺 Application Flow

```
                    ┌─────────────┐
                    │  Home Page  │
                    │  (Public)   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐           ┌──────▼──────┐
        │  Register │           │    Login    │
        └─────┬─────┘           └──────┬──────┘
              │                        │
        ┌─────▼─────┐                  │
        │  OTP Email│                 │
        │Verification│                 │
        └─────┬─────┘                  │
              └─────────────┬──────────┘
                            │
                   ┌────────▼────────┐
                   │  Role Detection │
                   └────────┬────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
    │   RENTER    │  │    OWNER    │  │ SUPER ADMIN│
    │  Dashboard  │  │  Dashboard  │  │  Dashboard │
    └──────┬──────┘  └──────┬──────┘  └─────┬──────┘
           │                │                │
    Browse/Search    Manage Listings    User Management
    Make Bookings    Handle Requests    Platform Overview
    View History     View Analytics
```

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code — Backend + Frontend |
| `backend-development` | Backend feature development |
| `frontend-development` | Frontend feature development |

---

## 📄 Documentation

Full technical documentation is available here (https://developerani01.github.io/RentNestDocomentation/)

## 👨‍💻 Author

**Anirban Mondal**
- GitHub: [@DeveloperAni01](https://github.com/DeveloperAni01)

