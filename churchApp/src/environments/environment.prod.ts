export const environment = {
  production: true,
  url: "https://mychurch.onrender.com",

  services: {
    messages: {
      message: '/messages',
      findByTitle: '/messages/title'
    },
    speaker: '/speakers',
    book: '/books'
  }
};
