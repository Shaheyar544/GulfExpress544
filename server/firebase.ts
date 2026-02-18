
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB1q8pfJVZH_4Pm1vQAfqr1a1gh2KpCO74",
    authDomain: "gulf-express-f3de8.firebaseapp.com",
    projectId: "gulf-express-f3de8",
    storageBucket: "gulf-express-f3de8.firebasestorage.app",
    messagingSenderId: "943229495572",
    appId: "1:943229495572:web:a3181013bc10953c90fa01"
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
