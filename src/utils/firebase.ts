import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCy2LN94AyjLHCV3mjWOu5nuR71AVDkrDc",
  authDomain: "hireiq-c1d7a.firebaseapp.com",
  projectId: "hireiq-c1d7a",
  storageBucket: "hireiq-c1d7a.firebasestorage.app",
  messagingSenderId: "775844734769",
  appId: "1:775844734769:web:e08eac8607bcaeecf57210",
  measurementId: "G-EWGHBVPQW9"
};

// Initialize Firebase for SSR / Client-side hydration
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
