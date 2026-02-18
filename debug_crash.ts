
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const logFile = path.resolve("server_debug.log");
const stream = fs.createWriteStream(logFile);

console.log("Starting server...");
const server = spawn("npm.cmd", ["run", "dev"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "development", PORT: "5000" },
    shell: true
});

server.stdout.on("data", (data) => {
    const msg = data.toString();
    console.log("SERVER STDOUT:", msg);
    stream.write(msg);
});

server.stderr.on("data", (data) => {
    const msg = data.toString();
    console.log("SERVER STDERR:", msg);
    stream.write(msg);
});

server.on("close", (code) => {
    console.log(`Server exited with code ${code}`);
    stream.end();
});

// Wait 10 seconds then kill it if it's still running, just to see startup logs
setTimeout(() => {
    console.log("Timeout reached, killing server for inspection...");
    server.kill();
}, 15000);
