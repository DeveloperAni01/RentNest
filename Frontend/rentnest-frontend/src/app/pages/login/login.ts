import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule],
  template: `
    <div class="flex justify-center items-center min-h-screen">
      <p-card header="Login to RentNest" styleClass="w-full max-w-md">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label>Email</label>
            <input pInputText [(ngModel)]="email" placeholder="Enter your email" class="w-full" />
          </div>

          <div class="flex flex-col gap-1">
            <label>Password</label>
            <p-password
              [(ngModel)]="password"
              placeholder="Enter your password"
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
          </div>

          <p-button label="Login" styleClass="w-full" [loading]="loading" (click)="login()" />

          <div class="text-center text-sm">
            Don't have an account?
            <a
              class="cursor-pointer"
              style="color: var(--primary)"
              (click)="router.navigate(['/register'])"
            >
              Register</a
            >
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    public router: Router,
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all fields',
      });
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Logged in successfully',
          });
          this.router.navigate(['/all-properties']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Login failed',
        });
      },
    });
  }
}
