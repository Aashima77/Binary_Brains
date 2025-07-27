import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const frameQueue = new Queue("camera-frames", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});