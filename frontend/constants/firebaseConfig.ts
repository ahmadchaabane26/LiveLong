import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4h_HwPVJvz17yHKR_5xV1f-Lr0txGmr8",
  authDomain: "livelong-c1f8d.firebaseapp.com",
  projectId: "livelong-c1f8d",
  storageBucket: "livelong-c1f8d.appspot.com",
  messagingSenderId: "1000640876107",
  appId: "1:1000640876107:web:3c05ea41c020f69533c7ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Firestore Database
const db = getFirestore(app);

export { auth, db };
export default app;