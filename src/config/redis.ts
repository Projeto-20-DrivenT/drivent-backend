import { createClient } from "redis";
import { promisify } from "util";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Promisify the Redis client methods
const getAsync = async (key: string) => {
  return await promisify(redisClient.get).bind(redisClient, key);
};
const setExAsync = (key: string, seconds: number, value: string) =>
  promisify(redisClient.setEx).bind(redisClient, key, seconds, value);
const DEFAULT_EXP = 30; // seconds

function connectRedis() {
  redisClient.connect();
}

export { redisClient, connectRedis, getAsync, setExAsync, DEFAULT_EXP };
