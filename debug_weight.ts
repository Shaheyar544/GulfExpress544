
import { db } from "./server/firebase";
import { doc, getDoc } from "firebase/firestore";

async function checkWeight() {
    const trackingNumber = "GC19614402AE";
    console.log(`Checking weight for ${trackingNumber}...`);

    try {
        const docRef = doc(db, "publicTrackingData", trackingNumber);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Document data:", JSON.stringify(data, null, 2));
            console.log("Weight field:", data.weight);
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
    // Keep process alive for a bit to ensure logs are flushed if needed
    setTimeout(() => process.exit(0), 1000);
}

checkWeight();
