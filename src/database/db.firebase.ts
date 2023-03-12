import {
  FB_APIKEY,
  FB_AUTHDOMAIN,
  FB_PROJECTID,
  FB_STORAGEBUCKET,
  FB_MESSAGINGSENDERID,
  FB_APPID,
  FB_MEASUREMENTID,
} from '../config';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import * as admin from 'firebase-admin';

const firebaseConfig = {
  apiKey: FB_APIKEY,
  authDomain: FB_AUTHDOMAIN,
  projectId: FB_PROJECTID,
  storageBucket: FB_STORAGEBUCKET,
  messagingSenderId: FB_MESSAGINGSENDERID,
  appId: FB_APPID,
  measurementId: FB_MEASUREMENTID,
};

// Initialize Firebase
export const adminFirebase = admin.initializeApp(firebaseConfig);
export const firebaseApp = initializeApp(firebaseConfig);
// export const firebaseAnalytics = await getAnalytics(firebaseApp);

// Firebase auth
export const firebaseAuth = getAuth(firebaseApp);
