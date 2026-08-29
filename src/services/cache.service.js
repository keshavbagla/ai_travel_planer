import redis from "../config/redis.js";

const get = async (key) => {
    try {
        const value = await redis.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error(
            `Redis GET failed [${key}]:`,
            error.message
        );

        // Cache failure should NOT break flight search.
        return null;
    }
};

const set = async (
    key,
    value,
    ttlSeconds
) => {
    try {
        await redis.set(
            key,
            JSON.stringify(value),
            "EX",
            ttlSeconds
        );

        return true;
    } catch (error) {
        console.error(
            `Redis SET failed [${key}]:`,
            error.message
        );

        return false;
    }
};

const del = async (key) => {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error(
            `Redis DELETE failed [${key}]:`,
            error.message
        );

        return false;
    }
};

export const cacheService = {
    get,
    set,
    del,
};