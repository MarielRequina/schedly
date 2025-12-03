// firebase/config.js
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAG0i3pa6hWDaW8a8-QpcfXKmECdYnvNMI",
  authDomain: "schedly-87272.firebaseapp.com",
  projectId: "schedly-87272",
  storageBucket: "schedly-87272.firebasestorage.app",
  messagingSenderId: "281484836803",
  appId: "1:281484836803:web:eda10a420dc05cdc02c776",
  measurementId: "G-10NMEEGVK9"
};

// Initialize Firebase only if no app exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const database = getFirestore(app);
export const Authentication = getAuth(app);
export const firebase = app;
