
import { createServer } from "http";
const server = createServer();
server.listen(5000, () => {
    console.log("Port 5000 is free");
    server.close();
});
server.on("error", (e) => {
    console.log("Port 5000 error:", e);
});
