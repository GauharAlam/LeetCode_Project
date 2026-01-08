// Redis is temporarily disabled due to authentication issues
// To re-enable, uncomment the code below and set correct REDIS_PASS in .env

/*
const { createClient } = require("redis");

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-14021.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 14021,
        connectTimeout: 10000
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Redis Client Connected'));

module.exports = redisClient;
*/

// Mock redis client - server will work without Redis
// All methods return false/null to allow the app to function without Redis
const mockRedisClient = {
    connect: async () => { console.log('Redis disabled - using mock client'); },
    get: async () => null,
    set: async () => null,
    del: async () => null,
    exists: async () => 0,  // Returns 0 (not found) - allows auth to pass
    quit: async () => { },
    isOpen: false
};

module.exports = mockRedisClient;

