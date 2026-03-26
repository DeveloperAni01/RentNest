export type PropertyType = 'Flat' | 'Apartment' | 'Hotel' | 'Bungalow' | 'Villa';

export interface PropertyImage {
  imageId: number;
  propertyId: number;
  imageUrl: string;
  displayOrder: number;
  uploadedAt: string;
}

export interface Property {
  propertyId: number;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  location: string;
  city: string;
  propertyType: PropertyType;
  pricePerNight: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  features: string;
  rating: number;
  isAvailable: boolean;
  createdAt: string;
  images: string[];
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  location: string;
  city: string;
  propertyType: PropertyType;
  pricePerNight: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  features: string;
}

export interface UpdatePropertyRequest {
  title: string;
  description: string;
  location: string;
  city: string;
  propertyType: PropertyType;
  pricePerNight: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  features: string;
  isAvailable: boolean;
}
