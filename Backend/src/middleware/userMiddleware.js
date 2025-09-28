const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");


const userMiddleware = async(req , res , next)=>{

    try{
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const {_id} = payload;

        if(!_id){
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if(!result)
            throw new Error("User doesn't Exist");

        // Check Redis ke blocked list me present to nahi hai 

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid token");

        req.result = result;

        next();

    }
    catch(err){
        res.send("Error"+err);
    }
}

module.exports = userMiddleware;