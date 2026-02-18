
import { db } from "./server/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

async function fixWeight() {
    const trackingNumber = "GC19614402AE";
    console.log(`Fixing weight for ${trackingNumber}...`);

    try {
        const docRef = doc(db, "publicTrackingData", trackingNumber);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, { weight: 6.96 });
            console.log("Successfully updated weight to 6.96 kg");

            const updatedSnap = await getDoc(docRef);
            console.log("Verified weight:", updatedSnap.data()?.weight);
        } else {
            console.log("No such document to update!");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
    // Keep process alive for a bit to ensure logs are flushed if needed
    setTimeout(() => process.exit(0), 1000);
}

fixWeight();
