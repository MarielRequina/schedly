// constants/firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, Firestore } from "firebase/firestore";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVOKS-j44iZRzwqOIuD0S5qPYAeYt-_3k",
  authDomain: "schedly-934a5.firebaseapp.com",
  projectId: "schedly-934a5",
  storageBucket: "schedly-934a5.appspot.com",
  messagingSenderId: "351258055167",
  appId: "1:351258055167:web:de9fbc93449b2d098817ca",
  measurementId: "G-RHN7TYT2QV",
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
