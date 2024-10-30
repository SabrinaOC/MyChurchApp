// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // url: 'http://localhost:3000',
  // url: 'https://mychurch.onrender.com',
  url: 'https://sabriojea-mychurch-api.k8s.arsahosting.net',

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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
