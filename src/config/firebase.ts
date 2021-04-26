require('dotenv').config();

const FirebaseConfig = {
  // Use your own firebase app config
  // https://firebase.google.com/docs/web/setup#config-object
  appConfig: JSON.parse(process.env.FIREBASE_CONFIG!),
  auth: {
    email: process.env.FIREBASE_AUTH_EMAIL,
    password: process.env.FIREBASE_AUTH_PASSWORD,
  },
  storageUrl: process.env.FIREBASE_STORAGE_URL
};

export default FirebaseConfig;
