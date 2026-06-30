const { createClerkClient, verifyToken } = require("@clerk/backend");
const User = require("../models/user");

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const userMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("[Clerk Auth] Request to:", req.originalUrl, "| Auth header present:", !!authHeader);
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token is not present");
        }

        const token = authHeader.split(" ")[1];
        console.log("[Clerk Auth] Token length:", token.length);

        // Verify Clerk JWT token
        let verified;
        try {
            verified = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY
            });
            console.log("[Clerk Auth] Token verified, sub:", verified.sub);
        } catch (e) {
            console.error("[Clerk Auth] Token verification failed:", e.message);
            throw new Error("Invalid token: " + e.message);
        }

        const clerkId = verified.sub;
        if (!clerkId) {
            throw new Error("Invalid token claim");
        }

        // Look up user in MongoDB
        let user = await User.findOne({ clerkId });
        console.log("[Clerk Auth] User found by clerkId:", !!user);

        if (!user) {
            // Fetch detailed user info from Clerk
            let clerkUser;
            try {
                clerkUser = await clerkClient.users.getUser(clerkId);
                console.log("[Clerk Auth] Fetched Clerk user:", clerkUser.emailAddresses?.[0]?.emailAddress);
            } catch (e) {
                console.error("[Clerk Auth] Failed to fetch Clerk user:", e.message);
                throw new Error("Failed to retrieve Clerk user: " + e.message);
            }

            const emailId = clerkUser.emailAddresses?.[0]?.emailAddress;
            if (!emailId) {
                throw new Error("Clerk user does not have a valid email address");
            }

            // Check if user already exists with this email address but without clerkId (e.g. legacy user)
            user = await User.findOne({ emailId });

            if (user) {
                // Link clerkId to existing user
                console.log("[Clerk Auth] Linking clerkId to existing user:", emailId);
                user.clerkId = clerkId;
                await user.save();
            } else {
                // Create new user in DB
                console.log("[Clerk Auth] Creating new user:", emailId);
                user = await User.create({
                    clerkId,
                    emailId,
                    firstName: clerkUser.firstName || clerkUser.username || "User",
                    lastName: clerkUser.lastName || undefined,
                    role: "user",
                    isVerified: true
                });
            }
        }

        req.result = user;
        next();
    }
    catch (err) {
        console.error("[Clerk Auth] ERROR:", err.message);
        res.status(401).send("Error: " + err.message);
    }
}

module.exports = userMiddleware;