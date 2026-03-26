import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '../../core/services/super-admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">Manage Owners</h2>

      <p-table
        [value]="owners"
        [loading]="loading"
        [paginator]="true"
        [rows]="10"
        responsiveLayout="scroll"
        styleClass="p-datatable-sm"
      >
        <ng-template #header>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Approved</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template #body let-owner>
          <tr>
            <td>{{ owner.fullName }}</td>
            <td>{{ owner.email }}</td>
            <td>{{ owner.phoneNumber }}</td>
            <td>
              <p-tag
                [value]="owner.isOwner ? 'Approved' : 'Pending'"
                [severity]="owner.isOwner ? 'success' : 'warn'"
              />
            </td>
            <td>
              <p-tag
                [value]="owner.isActive ? 'Active' : 'Disabled'"
                [severity]="owner.isActive ? 'success' : 'danger'"
              />
            </td>
            <td>
              <div class="flex gap-2 flex-wrap">
                <p-button
                  *ngIf="!owner.isOwner"
                  label="Approve"
                  severity="success"
                  size="small"
                  (click)="approve(owner.userId)"
                />
                <p-button
                  *ngIf="owner.isActive"
                  label="Disable"
                  severity="warn"
                  size="small"
                  (click)="disable(owner.userId)"
                />
                <p-button
                  *ngIf="!owner.isActive"
                  label="Enable"
                  severity="info"
                  size="small"
                  (click)="enable(owner.userId)"
                />
                <p-button
                  label="Delete"
                  severity="danger"
                  size="small"
                  (click)="confirmDelete(owner)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          <tr>
            <td colspan="6" class="text-center py-8 text-gray-500">No owners found</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-confirmdialog />
  `,
})
export class AdminComponent implements OnInit {
  owners: any[] = [];
  loading = false;

  constructor(
    private adminService: AdminService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadOwners();
  }

  loadOwners() {
    this.loading = true;
    this.adminService.getAllOwners().subscribe({
      next: (res) => {
            this.loading = false;
            console.log(res.data);
            
        if (res.success) this.owners = res.data;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  approve(id: string) {
    this.adminService.approveOwner(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Owner approved',
          });
          this.loadOwners();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to approve',
        });
      },
    });
  }

  enable(id: string) {
    this.adminService.enableOwner(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Owner enabled',
          });
          this.loadOwners();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to enable',
        });
      },
    });
  }

  disable(id: string) {
    this.adminService.disableOwner(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Owner disabled',
          });
          this.loadOwners();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to disable',
        });
      },
    });
  }

  confirmDelete(owner: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${owner.fullName}"?`,
      header: 'Delete Owner',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteOwner(owner.userId),
    });
  }

  deleteOwner(id: string) {
    this.adminService.deleteOwner(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Owner deleted',
          });
          this.loadOwners();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to delete',
        });
      },
    });
  }
}
