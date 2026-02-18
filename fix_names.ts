
import { db } from "./server/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

async function fixNames() {
    const trackingNumber = "GC19614402AE";
    console.log(`Fixing names for ${trackingNumber}...`);

    try {
        const docRef = doc(db, "publicTrackingData", trackingNumber);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, {
                senderName: "Oliver",
                receiverName: "Amazon Fullfilment Center" // Using spelling from screenshot
            });
            console.log("Successfully updated names.");

            const updatedSnap = await getDoc(docRef);
            console.log("Verified Sender:", updatedSnap.data()?.senderName);
            console.log("Verified Receiver:", updatedSnap.data()?.receiverName);
        } else {
            console.log("No such document to update!");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
    // Keep process alive for a bit to ensure logs are flushed
    setTimeout(() => process.exit(0), 1000);
}

fixNames();
