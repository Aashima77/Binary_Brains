import { Worker } from "bullmq";
import { redis, publisher } from "../lib/redis.js";
import { callFlask } from "./flask.js";
import { uploadToCloudinary } from "./cloudinary.js";
import { saveToDatabase } from "./db.js";

function emitToFrontend(cameraId, annotatedFrame, violation, labels) {
    try {
        const payload = JSON.stringify({
            event: "frameProcessed",
            data: { cameraId, annotatedFrame, violation, labels },
        });

        publisher.publish("socket-events", payload);
    } catch (err) {
        console.error("[Redis Pub/Sub]", err.message);
    }
}

async function processFrame(job) {
    const { cameraId, base64Frame } = job.data;

    try {
        const { annotated_frame, violation, violation_labels } = await callFlask(base64Frame);
        const labels = violation_labels.map((label) =>
            label.replace(/-/g, " ").toLowerCase()
        );
        console.log(labels)
        if (violation) {
            const cloudinaryUrl = await uploadToCloudinary(cameraId, annotated_frame);
            await saveToDatabase(cameraId, labels, cloudinaryUrl);
        }

        emitToFrontend(cameraId, annotated_frame, violation, labels);
    } catch (err) {
        console.error(`[Job Failed] Camera ${cameraId}:`, err.message);
        throw err;
    }
}

const worker = new Worker("camera-frames", processFrame, {
    connection: redis,
    concurrency: 3,
    removeOnComplete: {
        age: 60,
        count: 5
    },
    removeOnFail: {
        age: 60,
        count: 5
    }
});

worker.on("completed", (job) =>
    console.log(`Job completed: ID=${job.id}, Camera=${job.data.cameraId}`)
);

worker.on("failed", (job, err) =>
    console.error(`Job failed: ID=${job?.id}, Reason=${err.message}`)
);
