import { createClient } from "redis";
import { promisify } from 'util';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
console.log(process.env.REDIS_URL,)
// Optionally, handle Redis connection errors
redisClient.on('connect', () => {
  console.log('Connected to Redis server');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('error', (err) => {
  console.error('Redis Error: ', err);
});
redisClient.on('reconnecting', () => {
  console.log('Redis client is reconnecting');
});
// Connect to Redis server

console.log('Redis client setup is complete');

// Promisify the Redis client methods
const getAsync = async (key: string) => { return await promisify(redisClient.get).bind(redisClient, key)};
const setExAsync = (key: string, seconds: number, value: string) =>
  promisify(redisClient.setEx).bind(redisClient, key, seconds, value);
const DEFAULT_EXP = 30; // seconds

export { redisClient, getAsync, setExAsync, DEFAULT_EXP };