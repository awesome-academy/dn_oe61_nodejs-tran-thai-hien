export const INCLUDE_BOOKING_HISTORY = {
  booking: {
    select: {
      id: true,
      startTime: true,
      endTime: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};
