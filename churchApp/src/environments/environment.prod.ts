export const environment = {
  production: true,
  url: "https://sabriojea-mychurch-api.k8s.arsahosting.com",

  services: {
    messages: {
      message: '/messages',
      findByTitle: '/messages/title',
      filter: '/messages/filter'
    },
    speaker: '/speakers',
    book: '/books',
    messageTypes: '/messageTypes'
  },

  firebaseConfig: {
    apiKey: "AIzaSyA7nq8Ns2qE_GPLR7MP5DAj4H5lLBcnBf0",
    authDomain: "mychurch-22315.firebaseapp.com",
    projectId: "mychurch-22315",
    storageBucket: "mychurch-22315.appspot.com",
    messagingSenderId: "704862397394",
    appId: "1:704862397394:web:3344298526a87208f09e0b"
  }
};
