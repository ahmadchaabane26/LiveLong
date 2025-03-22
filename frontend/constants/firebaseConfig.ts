// constants/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD4h_HwPVJvz17yHKR_5xV1f-Lr0txGmr8",
  authDomain: "livelong-c1f8d.firebaseapp.com",
  projectId: "livelong-c1f8d",
  storageBucket: "livelong-c1f8d.appspot.com",
  messagingSenderId: "1000640876107",
  appId: "1:1000640876107:web:3c05ea41c020f69533c7ce"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
