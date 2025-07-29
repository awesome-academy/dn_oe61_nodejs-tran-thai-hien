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
export const VENUE_DETAIL = {
  venueAmenities: {
    select: {
      status: true,
      amenity: { select: { id: true, name: true } },
    },
  },
  owner: {
    select: {
      id: true,
      name: true,
      profile: {
        select: {
          address: true,
          phone: true,
        },
      },
    },
  },
  spaces: {
    select: {
      id: true,
      name: true,
      type: true,
      capacity: true,
      description: true,
    },
  },
};
