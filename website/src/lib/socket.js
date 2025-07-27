
import { Server } from "socket.io";
import { frameQueue } from "./queue.js";

let ioInstance = null;

export function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e7,
    });

    io.on("connection", (socket) => {
        socket.on("feed", async ({ frame, id }) => {
            try {
                await frameQueue.add("process-frame", {
                    cameraId: id,
                    base64Frame: frame,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error("Failed to add frame to queue:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    ioInstance = io;
    return io;
}

export function getIO() {
    if (!ioInstance) {
        throw new Error("Socket.io not initialized");
    }
    return ioInstance;
}
