const { models } = require("mongoose");
const User = require("../models/user")
const Validate = require("../utils/Validator")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");

// Register api

const register = async(req,res)=>{

    try {

        // validate the data
        Validate(req.body);
        const {firstName,emailId,password} = req.body;

        req.body.password= await bcrypt.hash(password,10);
        req.body.role = 'user'

        const user = await User.create(req.body);
        const token = jwt.sign({_id: User._id, emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).send("User Registered Succesfully");
    }
    catch (error) {
        res.status(400).send("Error: "+error);
    }
}

// Login api

const login = async(req,res)=>{

    try{
        const {emailId,password} = req.body;    

        if(!emailId)
            throw new Error("Invalid Credentials");

        if(!password)
            throw new Error("Invalid Credentials");

        const user  = await User.findOne({emailId});
        const match = await bcrypt.compare(password, user.password);

        if(!match)
            throw new Error("Wrong Password");

        const token = jwt.sign({_id: user._id,emailId:emailId,role:user.role}, process.env.JWT_KEY, {expiresIn:60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(200).send("Logged In Succesfully");
    }
    catch(err){
        res.status(401).send("Error:"+err);
    }
}

// Logout api

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,"Blocked");
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged out Succesfully");
    }
    catch(err){
        res.status(500).send("Error"+err);
    }
}

// Admin Register

const adminRegister = async(req , res)=>{

        try {

        // validate the data
        // if(req.result.role!='admin')
        //     throw new Error("Invalid User");
        
        Validate(req.body);
        const {firstName,emailId,password} = req.body;

        req.body.password= await bcrypt.hash(password,10);
        req.body.role = 'admin';

        const user = await User.create(req.body);
        const token = jwt.sign({_id: User._id, emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).send("User Registered Succesfully");
    }
    catch (error) {
        res.status(400).send("Error: "+error);
    }

}



module.exports = {register,login,logout,adminRegister};