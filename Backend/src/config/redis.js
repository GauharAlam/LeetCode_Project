const {createClient}  = require("redis");

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-17349.c281.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 17349
    }
});


module.exports = redisClient;