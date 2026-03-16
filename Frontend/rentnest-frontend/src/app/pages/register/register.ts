import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    SelectButtonModule,
    SelectModule,
  ],
  template: `
    <div class="flex justify-center items-center min-h-screen">
      <p-card header="Create Account" styleClass="w-full max-w-lg">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label>Register as</label>
            <p-selectbutton
              [(ngModel)]="role"
              [options]="roleOptions"
              optionLabel="label"
              optionValue="value"
              styleClass="w-full"
            />
          </div>

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label>First Name</label>
              <input
                pInputText
                [(ngModel)]="form.firstName"
                placeholder="First name"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label>Middle Name</label>
              <input
                pInputText
                [(ngModel)]="form.middleName"
                placeholder="middle name"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label>Last Name</label>
              <input
                pInputText
                [(ngModel)]="form.lastName"
                placeholder="Last name"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label>Email</label>
            <input
              pInputText
              [(ngModel)]="form.email"
              placeholder="Enter your email"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label>Phone Number</label>
            <input
              pInputText
              [(ngModel)]="form.phoneNumber"
              placeholder="Enter phone number"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label>Gender</label>
            <p-select
              [(ngModel)]="form.gender"
              [options]="genderOptions"
              placeholder="Select gender"
              styleClass="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label>Password</label>
            <p-password
              [(ngModel)]="form.password"
              placeholder="Enter password"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label>Confirm Password</label>
            <p-password
              [(ngModel)]="form.confirmPassword"
              placeholder="confirm password"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
          </div>

          <p-button label="Register" styleClass="w-full" [loading]="loading" (click)="register()" />

          <div class="text-center text-sm">
            Already have an account?
            <a
              class="cursor-pointer"
              style="color: var(--primary)"
              (click)="router.navigate(['/login'])"
            >
              Login</a
            >
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class RegisterComponent {
  role = 'Renter';
  loading = false;

  roleOptions = [
    { label: 'Renter', value: 'Renter' },
    { label: 'Owner', value: 'Owner' },
  ];

  genderOptions = ['Male', 'Female', 'Other'];

  form = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    public router: Router,
  ) {}

  register() {
    if (
      !this.form.firstName ||
      !this.form.email ||
      !this.form.password ||
      !this.form.confirmPassword ||
      !this.form.gender ||
      !this.form.phoneNumber
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all fields',
      });
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Passwords do not match',
      });
      return;
    }

    this.loading = true;
    const request =
      this.role === 'Owner'
        ? this.authService.registerOwner(this.form)
        : this.authService.registerUser(this.form);

    request.subscribe({
      next: (res) => {
        console.log(res);

        this.loading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registration successful! Please verify your email.',
          });
          this.router.navigate(['/verify-otp'], { queryParams: { email: this.form.email } });
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Registration failed',
        });
      },
    });
  }
}
