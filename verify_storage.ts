
import { storage } from "./server/storage";

async function main() {
    console.log("Testing setSiteConfig...");
    try {
        await storage.setSiteConfig("test_key", "test_value");
        console.log("Successfully set test_key");
        const val = await storage.getSiteConfig("test_key");
        console.log("Retrieved:", val);
    } catch (e) {
        console.error("Storage test failed:", e);
    }
}

main().catch(console.error);
