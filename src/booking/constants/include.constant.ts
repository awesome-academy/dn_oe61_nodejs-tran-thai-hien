export const INCLUDE_BOOKING_SUMMARY = {
  space: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};
export const INCLUDE_PAYLOAD_EMAIL_BOOKING = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  space: true,
};
export const INCLUDE_BOOKING_INFO = {
  space: {
    include: {
      venue: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};
