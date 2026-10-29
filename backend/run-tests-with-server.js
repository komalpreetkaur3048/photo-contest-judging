import { spawn } from "child_process";
import http from "http";

console.log("🚀 Starting PhotoJudge backend server for integration testing...");

const serverProcess = spawn("node", ["server.js"], {
    stdio: "inherit",
    env: process.env
});

const waitForServer = async (retries = 30, delay = 500) => {
    for (let i = 0; i < retries; i++) {
        try {
            await new Promise((resolve, reject) => {
                const req = http.get("http://localhost:5001/api", (res) => {
                    if (res.statusCode === 200) resolve();
                    else reject(new Error(`Status ${res.statusCode}`));
                });
                req.on("error", reject);
            });
            return true;
        } catch {
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    return false;
};

const run = async () => {
    const isReady = await waitForServer();
    if (!isReady) {
        console.error("❌ Backend server failed to start in time.");
        serverProcess.kill();
        process.exit(1);
    }

    console.log("✅ Backend server is online! Running comprehensive route tests...\n");

    const testProcess = spawn("node", ["test-routes.js"], {
        stdio: "inherit",
        env: process.env
    });

    testProcess.on("close", (code) => {
        console.log(`\n🛑 Shutting down backend test server...`);
        serverProcess.kill();
        process.exit(code);
    });
};

run();

