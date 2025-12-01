// firebase/config.js
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2IJjcdjqgmswbvaAwWMTDjGKe432_ErY",
  authDomain: "schedlysalon.firebaseapp.com",
  projectId: "schedlysalon",
  storageBucket: "schedlysalon.firebasestorage.app",
  messagingSenderId: "985547010552",
  appId: "1:985547010552:web:c00be57c0b4d8a0d74a60d",
  measurementId: "G-ZZG4LM6PDQ"
};

// Initialize Firebase only if no app exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const database = getFirestore(app);
export const Authentication = getAuth(app);
export const firebase = app;
