import Redis from "ioredis";

const redis = new Redis(
    process.env.REDIS_URL ||
        "redis://127.0.0.1:6379",
    {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
    }
);

redis.on("connect", () => {
    console.log("Redis connected.");
});

redis.on("ready", () => {
    console.log("Redis ready.");
});

redis.on("error", (error) => {
    console.error(
        "Redis error:",
        error.message
    );
});

export default redis;