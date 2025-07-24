import { ValidationError } from '@nestjs/common';
import { Amenity, AmenityStatus, Space, User } from '@prisma/client';

export type ValidationErrorResponse = { message: ValidationError[] };
export type OwnerLite = Pick<User, 'id' | 'name'>;
export type AmenityLite = Pick<Amenity, 'id' | 'name'>;
export type SpaceLite = Pick<Space, 'id' | 'name'>;
export type AmenityWithStatus = {
  status: AmenityStatus;
  amenity: Pick<Amenity, 'id' | 'name'>;
};
