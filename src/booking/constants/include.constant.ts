export const INCLUDE_BOOKING_SUMMARY = {
  space: {
    select: {
      id: true,
      name: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
    },
  },
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
