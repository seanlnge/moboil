"use client";

/* FIREBASE CONFIG */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhJy8_bjc9PDicp4XuyH0wczb4XcBzdH0",
  authDomain: "moboil-95539.firebaseapp.com",
  projectId: "moboil-95539",
  storageBucket: "moboil-95539.firebasestorage.app",
  messagingSenderId: "967475942973",
  appId: "1:967475942973:web:b6fca624cce6dc7b6f3c54",
  measurementId: "G-753XT7ZG9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.useDeviceLanguage();

const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics, db, auth, googleProvider };