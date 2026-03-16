import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputOtpModule, ButtonModule],
  template: `
    <div class="flex justify-center items-center min-h-screen">
      <p-card header="Verify Your Email" styleClass="w-full max-w-md">
        <div class="flex flex-col gap-4 items-center">
          <p class="text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to <strong>{{ email }}</strong>
          </p>

          <p-inputotp [(ngModel)]="otp" [length]="6" />

          <p-button label="Verify OTP" styleClass="w-full" [loading]="loading" (click)="verify()" />

          <p-button
            label="Resend OTP"
            severity="secondary"
            variant="text"
            [loading]="resendLoading"
            (click)="resend()"
          />
        </div>
      </p-card>
    </div>
  `,
})
export class VerifyOtpComponent implements OnInit {
  otp = '';
  email = '';
  loading = false;
  resendLoading = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    public router: Router,
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  verify() {
    if (!this.otp || this.otp.length < 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter the 6-digit OTP',
      });
      return;
    }

    this.loading = true;
    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Email verified! Please login.',
          });
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'OTP verification failed',
        });
      },
    });
  }

  resend() {
    this.resendLoading = true;
    this.authService.resendOtp(this.email).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'OTP resent successfully',
        });
      },
      error: (err) => {
        this.resendLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to resend OTP',
        });
      },
    });
  }
}
