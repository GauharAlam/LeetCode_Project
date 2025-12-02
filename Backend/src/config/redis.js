// const {createClient}  = require("redis");

// const redisClient = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: 'redis-15246.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 15246
//     }
// });

const { createClient } = require("redis");

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-14021.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 14021,
        connectTimeout: 10000 // Optional: Increase timeout to 10 seconds
    }
});

// IMPORTANT: Add these event listeners to prevent crashes
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

module.exports = redisClient;