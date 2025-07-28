import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PW,
  maxRetriesPerRequest: null
};

export const redis = new Redis(redisOptions);
redis.on("connect", () => console.log("BullMQ Redis connected"));
redis.on("error", (err) => console.error("BullMQ Redis error:", err));

export const publisher = new Redis(redisOptions);
publisher.on("connect", () => console.log("Pub/Sub Publisher Redis connected"));
publisher.on("error", (err) => console.error("Pub/Sub Publisher Redis error:", err));

export const subscriber = new Redis(redisOptions);
subscriber.on("connect", () => console.log("Pub/Sub Subscriber Redis connected"));
subscriber.on("error", (err) => console.error("Pub/Sub Subscriber Redis error:", err));