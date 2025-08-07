export const INCLUDE_CHAT_SUMMARY = {
  receiver: {
    select: {
      id: true,
      name: true,
    },
  },
  sender: {
    select: {
      id: true,
      name: true,
    },
  },
};
