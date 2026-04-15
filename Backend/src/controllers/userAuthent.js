const { models } = require("mongoose");
const User = require("../models/user")
const Validate = require("../utils/Validator")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { blockToken, isTokenBlocked } = require("../utils/tokenBlocklist");
const Submission = require("../models/submission");
const sendEmail = require("../utils/sendEmail");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Register api

const register = async (req, res) => {

    try {
        // validate the data
        await Validate(req.body);
        const { firstName, emailId, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ emailId });
        
        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: "Email is already registered. Please log in." });
            } else {
                // User exists but unverified. Resend OTP and update password
                user.password = await bcrypt.hash(password, 10);
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = otp;
                user.otpExpiry = Date.now() + 10 * 60 * 1000;
                await user.save();

                await sendEmail({
                    email: user.emailId,
                    subject: "Verify your email - AlgoForge",
                    message: `
                        <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #ff6b00;">Welcome to AlgoForge!</h2>
                            <p>Hi ${user.firstName},</p>
                            <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This code will expire in 10 minutes.</p>
                            <div style="background: #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                ${otp}
                            </div>
                            <p>If you didn't create an account with AlgoForge, please ignore this email.</p>
                        </div>
                    `
                });

                return res.status(200).json({
                    message: "Welcome back! A new OTP was sent to your email to complete verification.",
                    requiresOtp: true,
                    emailId: user.emailId
                });
            }
        }

        // New User
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user'

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // set expiry to 10 mins from now
        req.body.otp = otp;
        req.body.otpExpiry = Date.now() + 10 * 60 * 1000;
        req.body.isVerified = false;

        user = await User.create(req.body);

        // Send Email
        const emailSent = await sendEmail({
            email: user.emailId,
            subject: "Verify your email - AlgoForge",
            message: `
                <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #ff6b00;">Welcome to AlgoForge!</h2>
                    <p>Hi ${user.firstName},</p>
                    <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This code will expire in 10 minutes.</p>
                    <div style="background: #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>If you didn't create an account with AlgoForge, please ignore this email.</p>
                </div>
            `
        });

        // We DO NOT send the JWT token here anymore, because they must verify first!
        res.status(201).json({
            message: "OTP sent to email. Please verify.",
            requiresOtp: true,
            emailId: user.emailId
        });
    }
    catch (error) {
        return res.status(400).json({ 
            message: error.message || "Registration failed. Please check your inputs." 
        });
    }
}

// Login api

const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;
        console.log(`[Auth] Login attempt for: ${emailId}`);

        if (!emailId)
            throw new Error("Invalid Credentials");

        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if (!user) {
            console.log(`[Auth] User not found: ${emailId}`);
            throw new Error("Invalid Credentials");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log(`[Auth] Password mismatch for: ${emailId}`);
            throw new Error("Wrong Password");
        }

        // Check if verified
        if (!user.isVerified) {
            console.log(`[Auth] User unverified: ${emailId}. Sending fresh OTP.`);
            // Generate a fresh OTP for login verification step
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpiry = Date.now() + 10 * 60 * 1000;
            await user.save();

            await sendEmail({
                email: user.emailId,
                subject: "Verify your email - AlgoForge",
                message: `
                    <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #ff6b00;">Welcome to AlgoForge!</h2>
                        <p>Hi ${user.firstName},</p>
                        <p>Your account requires email verification. Please use the following One-Time Password (OTP) to verify your email address. This code will expire in 10 minutes.</p>
                        <div style="background: #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            ${otp}
                        </div>
                    </div>
                `
            });

            return res.status(403).json({ 
                message: "Please check your email. A new verification OTP has been sent to align with security policies.", 
                requiresOtp: true,
                emailId: user.emailId
            });
        }

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }

        // Access token - 1 hour
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

        // Refresh token - 7 days
        const refreshToken = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '7d' });

        console.log(`[Auth] Login success for: ${emailId}. Setting cookies (Secure: ${COOKIE_OPTIONS.secure})`);

        res.cookie('token', token, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            user: reply,
            message: "Login Succesfully"
        })
    }
    catch (err) {
        res.status(401).json({ message: err.message || "Login Failed" });
    }
}

// Refresh Token - issues a new access token using the refresh token
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Check if refresh token is blocked
        const isBlocked = await isTokenBlocked(refreshToken);
        if (isBlocked) {
            return res.status(401).json({ message: "Refresh token is invalid" });
        }

        const payload = jwt.verify(refreshToken, process.env.JWT_KEY);

        const user = await User.findById(payload._id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Issue new access token
        const newToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', newToken, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            },
            message: "Token refreshed"
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
}


// Logout api

const logout = async (req, res) => {

    try {
        const { token, refreshToken } = req.cookies;
        const payload = jwt.decode(token);

        await blockToken(token, payload.exp);

        // Also block the refresh token
        if (refreshToken) {
            const refreshPayload = jwt.decode(refreshToken);
            if (refreshPayload) {
                await blockToken(refreshToken, refreshPayload.exp);
            }
        }

        res.cookie("token", null, { 
            ...COOKIE_OPTIONS,
            expires: new Date(0),
        });
        res.cookie("refreshToken", null, { 
            ...COOKIE_OPTIONS,
            expires: new Date(0),
        });
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
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

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
        await Submission.deleteMany({ userId: userId });

        res.status(200).send("Deleted Succesfully");
    }
    catch (error) {
        res.status(500).send("Internal Server Error" + error);
    }
}

// verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { emailId, otp } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("User not found");

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // OTP is valid
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Log them in
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        
        res.cookie('token', token, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Email verified correctly, logged in.",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message || "An error occurred during verification" });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    try {
        const { emailId } = req.body;
        const user = await User.findOne({ emailId });
        
        if (!user) throw new Error("User not found");
        if (user.isVerified) throw new Error("User already verified");

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.emailId,
            subject: "Your new OTP - AlgoForge",
            message: `
                <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #ff6b00;">AlgoForge</h2>
                    <p>Hi ${user.firstName},</p>
                    <p>A new OTP was requested for your account. It will expire in 10 minutes.</p>
                    <div style="background: #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                </div>
            `
        });

        res.status(200).json({ message: "New OTP sent to your email." });
    } catch (err) {
        res.status(400).json({ message: err.message || "An error occurred" });
    }
}

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { emailId } = req.body;
        const user = await User.findOne({ emailId });
        
        if (!user) throw new Error("If an account with that email exists, an OTP will be sent.");

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.emailId,
            subject: "Password Reset Request - AlgoForge",
            message: `
                <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #ff6b00;">Password Reset</h2>
                    <p>Hi ${user.firstName},</p>
                    <p>We received a request to reset your password. Use the following OTP to complete the reset. It will expire in 15 minutes.</p>
                    <div style="background: #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                </div>
            `
        });

        res.status(200).json({ message: "If an account with that email exists, an OTP will be sent." });
    } catch (err) {
        // Return same message to prevent email enumeration
        res.status(200).json({ message: "If an account with that email exists, an OTP will be sent." });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { emailId, otp, newPassword } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid details");

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // OTP is valid, reset password
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ message: "Password has been successfully reset. You can now login." });
    } catch (err) {
        res.status(400).json({ message: err.message || "An error occurred during password reset" });
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile, verifyOtp, resendOtp, forgotPassword, resetPassword, refreshAccessToken };