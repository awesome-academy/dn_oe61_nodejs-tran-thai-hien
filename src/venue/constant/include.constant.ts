export const VENUE_INCLUDE_SUMMARY = {
  venueAmenities: {
    select: {
      status: true,
      amenity: { select: { id: true, name: true } },
    },
  },
  owner: { select: { id: true, name: true } },
  spaces: { select: { id: true, name: true } },
};
