import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDn4sjVu_Ll4nfnUCmitpjKn92rPyXnhw",
  authDomain: "hireiq-ie.firebaseapp.com",
  projectId: "hireiq-ie",
  storageBucket: "hireiq-ie.firebasestorage.app",
  messagingSenderId: "4959684268",
  appId: "1:4959684268:web:fec4ba1a3298d78e4c8109",
  measurementId: "G-V9C46RJD1W"
};

// Initialize Firebase for SSR / Client-side hydration
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
