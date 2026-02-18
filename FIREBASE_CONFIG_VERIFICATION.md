# Firebase Configuration File - Full Content

## Complete File: `client/src/lib/firebase.ts`

```typescript
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
```

## Configuration Values Breakdown

Here are the individual values for easy comparison with your Firebase Console:

### Firebase Configuration Object Values:

```
apiKey: "AIzaSyB1q8pfJVZH_4Pm1vQAfqr1a1gh2KpCO74"
authDomain: "gulf-express-f3de8.firebaseapp.com"
projectId: "gulf-express-f3de8"
storageBucket: "gulf-express-f3de8.firebasestorage.app"
messagingSenderId: "943229495572"
appId: "1:943229495572:web:a3181013bc10953c90fa01"
```

## Verification Checklist

Please compare these values with your Firebase Console:

1. **Go to Firebase Console** → Your Project → Project Settings (gear icon) → General tab
2. **Scroll down to "Your apps"** section
3. **Find your Web app** (or create one if it doesn't exist)
4. **Compare each value:**

   - ✅ **apiKey**: Should match exactly (no spaces, correct case)
   - ✅ **authDomain**: Should be `{projectId}.firebaseapp.com`
   - ✅ **projectId**: Should match your project ID exactly
   - ✅ **storageBucket**: Should be `{projectId}.appspot.com` or `{projectId}.firebasestorage.app`
   - ✅ **messagingSenderId**: Should match the numeric sender ID
   - ✅ **appId**: Should match the full app ID string

## Common Issues to Check

1. **Trailing Spaces**: Make sure there are no spaces before/after the values
2. **Quotes**: Values should be wrapped in double quotes `"`
3. **Commas**: Each property except the last should have a comma
4. **Project ID Case**: Project IDs are case-sensitive
5. **API Key Format**: API keys should start with "AIza" and be ~39 characters

## How to Get Correct Values from Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **gulf-express-f3de8**
3. Click the ⚙️ (gear icon) → **Project settings**
4. Scroll to **"Your apps"** section
5. Click on your Web app (or create one if needed)
6. Under **"SDK setup and configuration"**, select **"Config"**
7. Copy the values from the `firebaseConfig` object shown there

## If Values Don't Match

If any values don't match, please:
1. Copy the correct values from Firebase Console
2. Replace them in the `firebaseConfig` object
3. Make sure to maintain the exact formatting (quotes, commas, etc.)


