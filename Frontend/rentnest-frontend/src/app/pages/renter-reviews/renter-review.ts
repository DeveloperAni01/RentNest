import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, RatingModule, TagModule],
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">My Reviews</h2>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
      </div>

      <!-- No Reviews -->
      <div *ngIf="!loading && reviews.length === 0" class="text-center py-12 text-gray-500">
        <i class="pi pi-star text-5xl mb-4 block"></i>
        <p>No reviews yet</p>
      </div>

      <!-- Reviews Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <p-card *ngFor="let review of reviews">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <span class="font-semibold">{{ review.propertyTitle }}</span>
              <span class="text-xs text-gray-400">{{ review.createdAt | date: 'mediumDate' }}</span>
            </div>
            <p-rating [(ngModel)]="review.rating" [readonly]="true" />
            <p-tag [value]="review.rating + ' / 5'" severity="info" />
          </div>
        </p-card>
      </div>
    </div>
  `,
})
export class MyReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;

  constructor(private reviewService: ReviewService) {}

  ngOnInit() {
    this.loading = true;
    this.reviewService.getMyReviews().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.reviews = res.data;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
