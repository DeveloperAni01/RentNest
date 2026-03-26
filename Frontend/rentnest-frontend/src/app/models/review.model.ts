export interface Review {
  reviewId: number;
  userId: string;
  reservationId: number;
  propertyId: number;
  propertyTitle?: string;
  rating: number;
  createdAt: string;
  renterName?: string;
}

export interface CreateReviewRequest {
  reservationId: number;
  propertyId: number;
  rating: number;
}
