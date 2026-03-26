const jwt = require("jsonwebtoken");
const { isTokenBlocked } = require("../utils/tokenBlocklist");
const User = require("../models/user");


const adminMiddleware = async(req , res , next)=>{

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
        
        if(payload.role!='admin')
            throw new Error("Invalid token");

        if(!result)
            throw new Error("User doesn't Exist");

        // Check if token is in the blocked list
        const IsBlocked = await isTokenBlocked(token);

        if(IsBlocked)
            throw new Error("Invalid token");

        req.result = result;

        next();

    }
    catch(err){
        res.status(401).json({ message: "Unauthorized: " + err.message });
    }
}

module.exports = adminMiddleware;