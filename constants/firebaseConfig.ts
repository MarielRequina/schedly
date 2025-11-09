// constants/firebaseConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// ✅ Your Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyAG0i3pa6hWDaW8a8-QpcfXKmECdYnvNMI",
  authDomain: "schedly-87272.firebaseapp.com",
  projectId: "schedly-87272",
  storageBucket: "schedly-87272.firebasestorage.app",
  messagingSenderId: "281484836803",
  appId: "1:281484836803:web:eda10a420dc05cdc02c776",
  measurementId: "G-10NMEEGVK9",
};

// ✅ Initialize Firebase App (only once)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// ✅ Initialize Firebase Auth safely for React Native
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized, reuse the existing instance
  auth = getAuth(app);
}

// ✅ Initialize Firestore
const db: Firestore = getFirestore(app);

export { app, auth, db };

