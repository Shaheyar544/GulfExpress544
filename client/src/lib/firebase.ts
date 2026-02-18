// File: client/src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your Gulf Courier web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1q8pfJVZH_4Pm1vQAfqr1a1gh2KpCO74",
  authDomain: "gulf-express-f3de8.firebaseapp.com",
  projectId: "gulf-express-f3de8",
  storageBucket: "gulf-express-f3de8.firebasestorage.app",
  messagingSenderId: "943229495572",
  appId: "1:943229495572:web:a3181013bc10953c90fa01"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// LOCAL EMULATOR CONFIGURATION (OPTIONAL - Commented out by default)
// Only uncomment and use if you have Firebase emulators running locally
// To use emulators:
// 1. Install Firebase CLI: npm install -g firebase-tools
// 2. Run: firebase emulators:start
// 3. Uncomment the code below

/*
if (process.env.NODE_ENV === 'development') {
  try {
    // Only connect if emulators are explicitly enabled
    // Set VITE_USE_FIREBASE_EMULATOR=true in your .env file
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      console.log("Connecting to Firebase Emulators...");
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error: any) {
    // Silently fail if emulators are not available
    if (!error?.message?.includes('already been connected')) {
      console.warn("Firebase emulators not available");
    }
  }
}
*/

export default app;

