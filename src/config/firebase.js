// Firebase v9+ Modular SDK Configuration
// Docs: https://firebase.google.com/docs/web/setup
//
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use an existing one)
// 3. Click "Add app" -> Web (</>)
// 4. Register your app and copy the firebaseConfig object
// 5. Enable Authentication -> Sign-in method -> Email/Password
// 6. Enable Cloud Firestore -> Create database -> Start in test mode
// 7. Replace the placeholder values below with your project's config

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "fir-project-4db1f.firebaseapp.com",
  databaseURL: "https://fir-project-4db1f.firebaseio.com",
  projectId: "fir-project-4db1f",
  storageBucket: "fir-project-4db1f.firebasestorage.app",
  messagingSenderId: "122224133326",
  appId: "1:122224133326:web:b09c809e0d4ea142f4fc9f",
  measurementId: "G-HW4SNZW7Q0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
