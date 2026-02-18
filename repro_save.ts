
// using native fetch

async function main() {
    console.log("1. Fetching CSRF token...");
    try {
        const csrfRes = await fetch("http://localhost:5000/api/csrf-token");
        if (!csrfRes.ok) {
            console.error("Failed to get CSRF token:", csrfRes.status);
            return;
        }
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.csrfToken;
        const cookie = csrfRes.headers.get("set-cookie");

        console.log("Got CSRF Token:", csrfToken);

        console.log("2. Sending POST request to save settings...");
        const res = await fetch("http://localhost:5000/api/settings/integrations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "CSRF-Token": csrfToken,
                "Cookie": cookie || ""
            },
            body: JSON.stringify({
                trackingNumberPattern: "GC-UAE-{year}-{random}",
            }),
        });

        console.log("Response status:", res.status);
        const text = await res.text();
        console.log("Response body:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

main();
