export class VenueStatusNotiPayload {
  venueId: number;
  venueName: string;
  ownerId: number;
  actionBy: string;
  reason?: string;
  updatedAt: Date;
}
