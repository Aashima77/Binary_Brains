
import { createServer } from "http";
import next from "next";
import { initSocket, getIO } from "../lib/socket.js";
import { subscriber } from "../lib/redis.js";

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

subscriber.subscribe("socket-events", (err, count) => {
    if (err) {
        console.error("Failed to subscribe to Redis channel:", err.message);
    }
});

subscriber.on("message", (channel, message) => {
    try {
        const { event, data } = JSON.parse(message);
        const io = getIO();
        io.emit(event, data);
    } catch (err) {
        console.error("Socket emit failed:", err.message);
    }
});

app.prepare().then(async () => {
    const server = createServer((req, res) => handle(req, res));
    try {
        initSocket(server);
    } catch (err) {
        console.error("Failed to initialize Socket.IO:", err.message);
    }
    server.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}`);
    });
});