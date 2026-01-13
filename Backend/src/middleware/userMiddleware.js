const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");


const userMiddleware = async (req, res, next) => {

    try {
        console.log('userMiddleware: checking auth...');
        const { token } = req.cookies;
        console.log('userMiddleware: token present:', !!token);

        if (!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        console.log('userMiddleware: user ID from token:', _id);

        if (!_id) {
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);
        console.log('userMiddleware: user found:', !!result);

        if (!result)
            throw new Error("User doesn't Exist");

        // Check Redis ke blocked list me present to nahi hai 
        console.log('userMiddleware: checking Redis blocklist...');
        const IsBlocked = await redisClient.exists(`token:${token}`);
        console.log('userMiddleware: isBlocked:', IsBlocked);

        if (IsBlocked)
            throw new Error("Invalid token");

        req.result = result;
        console.log('userMiddleware: auth successful!');

        next();

    }
    catch (err) {
        console.log('userMiddleware ERROR:', err.message);
        res.status(401).send("Error: " + err);
    }
}

module.exports = userMiddleware;