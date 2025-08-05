import { ValidationError } from '@nestjs/common';
import {
  Amenity,
  AmenityStatus,
  Booking,
  Profile,
  Space,
  SpacePrice,
  User,
  Venue,
} from '@prisma/client';

export type ValidationErrorResponse = { message: ValidationError[] };
export type OwnerLite = Pick<User, 'id' | 'name'>;
export type BookingLite = Pick<Booking, 'id' | 'startTime' | 'endTime'>;
export type AmenityLite = Pick<Amenity, 'id' | 'name'>;
export type SpaceLite = Pick<Space, 'id' | 'name'>;
export type ProfileLite = Pick<Profile, 'address' | 'phone'>;
export type AmenityWithStatus = {
  status: AmenityStatus;
  amenity: AmenityLite;
};
export type SpaceDetail = Pick<
  Space,
  'id' | 'name' | 'type' | 'capacity' | 'description'
>;
export type OwnerDetail = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
};
export type PriceLite = Pick<SpacePrice, 'price' | 'unit'>;
export type VenueLite = Pick<Venue, 'id' | 'name'>;
