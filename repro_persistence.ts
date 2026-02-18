
import { db } from "./server/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function testPersistence() {
    console.log("Starting persistence test...");
    const testKey = "tracking_number_pattern";
    const testValue = "GC{day}{random}{month}AE";

    try {
        console.log(`Attempting to write to site_configs/${testKey}...`);
        const docRef = doc(db, "site_configs", testKey);
        await setDoc(docRef, { key: testKey, value: testValue, updatedAt: new Date() });
        console.log("Write successful!");
    } catch (error) {
        console.error("Write failed:", error);
    }

    try {
        console.log(`Attempting to read from site_configs/${testKey}...`);
        const docRef = doc(db, "site_configs", testKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Read successful! Data:", data);
            if (data.value === testValue) {
                console.log("Value matches!");
            } else {
                console.error("Value Mismatch! Expected:", testValue, "Got:", data.value);
            }
        } else {
            console.error("Document not found!");
        }
    } catch (error) {
        console.error("Read failed:", error);
    }
    process.exit(0);
}

testPersistence();
