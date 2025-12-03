const { models } = require("mongoose");
const User = require("../models/user")
const Validate = require("../utils/Validator")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");
const Submission = require("../models/submission");

// Register api

const register = async (req, res) => {

    try {

        // validate the data
        await Validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user'

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        // Return full user info including role
        res.status(201).json({
            message: "User Registered Succesfully",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(400).send("Error: " + error);
    }
}

// Login api

const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");

        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if(!user) throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Wrong Password");

        const reply = {
            firstName : user.firstName,
            emailId : user.emailId,
            _id : user._id,
            role: user.role // ADDED ROLE HERE
        }

        constjh = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(200).json({
            user:reply,
            message:"Login Succesfully"
        })
    }
    catch (err) {
        res.status(401).send("Error:" + err);
    }
}

// Logout api

const logout = async (req, res) => {

    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("Logged out Succesfully");
    }
    catch (err) {
        res.status(500).send("Error" + err);
    }
}

// Admin Register

const adminRegister = async (req, res) => {

    try {
        Validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'admin';

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'admin' }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        
         res.status(201).json({
            message: "Admin Registered Succesfully",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(400).send("Error: " + error);
    }

}

const deleteProfile = async (req, res) => {

    try {
        const userId = req.result._id;

        // Delete form Schema
        await User.findByIdAndDelete(userId);

        // Delete from submission also 
        await Submission.deleteMany({ userId: userId }); // Fixed Mongoose query

        res.status(200).send("Deleted Succesfully");
    }
    catch(error){
        res.status(500).send("Internal Server Error"+error);
    }
}

module.exports = { register, login, logout, adminRegister, deleteProfile };