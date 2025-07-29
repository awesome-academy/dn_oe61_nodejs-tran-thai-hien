export const SPACE_SUMMARY_INCLUDE = {
  spaceAmenities: {
    select: {
      status: true,
      amenity: { select: { id: true, name: true } },
    },
  },
  venue: { select: { id: true, name: true } },
  spacePrices: {
    select: {
      unit: true,
      price: true,
    },
  },
  spaceManagers: {
    select: {
      manager: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};
export const SPACE_MANAGER_INCLUDE = {
  manager: {
    select: {
      id: true,
      name: true,
    },
  },
};
