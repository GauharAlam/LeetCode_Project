const { createClerkClient, verifyToken } = require("@clerk/backend");
const User = require("../models/user");

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const adminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("[Clerk Admin Auth] Request to:", req.originalUrl, "| Auth header present:", !!authHeader);
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new Error("Token is not present");
        }

        const token = authHeader.split(" ")[1];

        // Verify Clerk JWT token
        let verified;
        try {
            verified = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY
            });
            console.log("[Clerk Admin Auth] Token verified, sub:", verified.sub);
        } catch (e) {
            console.error("[Clerk Admin Auth] Token verification failed:", e.message);
            throw new Error("Invalid token: " + e.message);
        }

        const clerkId = verified.sub;
        if (!clerkId) {
            throw new Error("Invalid token claim");
        }

        // Look up user in MongoDB
        let user = await User.findOne({ clerkId });

        if (!user) {
            // Fetch detailed user info from Clerk
            let clerkUser;
            try {
                clerkUser = await clerkClient.users.getUser(clerkId);
                console.log("[Clerk Admin Auth] Fetched Clerk user:", clerkUser.emailAddresses?.[0]?.emailAddress);
            } catch (e) {
                console.error("[Clerk Admin Auth] Failed to fetch Clerk user:", e.message);
                throw new Error("Failed to retrieve Clerk user: " + e.message);
            }

            const emailId = clerkUser.emailAddresses?.[0]?.emailAddress;
            if (!emailId) {
                throw new Error("Clerk user does not have a valid email address");
            }

            // Check if user already exists with this email address but without clerkId
            user = await User.findOne({ emailId });

            if (user) {
                console.log("[Clerk Admin Auth] Linking clerkId to existing user:", emailId);
                user.clerkId = clerkId;
                await user.save();
            } else {
                console.log("[Clerk Admin Auth] Creating new user:", emailId);
                user = await User.create({
                    clerkId,
                    emailId,
                    firstName: clerkUser.firstName || clerkUser.username || "User",
                    lastName: clerkUser.lastName || undefined,
                    role: "user", // Default is user
                    isVerified: true
                });
            }
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
            console.warn(`[Clerk Admin Auth] Access denied: User ${user.emailId} is not an admin`);
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.result = user;
        next();
    }
    catch (err) {
        console.error("[Clerk Admin Auth] ERROR:", err.message);
        res.status(401).json({ message: "Unauthorized: " + err.message });
    }
};

module.exports = adminMiddleware;