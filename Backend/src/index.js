require("dotenv").config();
const express = require("express")
const app = express();
const main = require("./config/db");
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const studyPlanRouter = require("./routes/studyPlan");
const socialAuthRouter = require("./routes/socialAuth");
const cronRouter = require("./routes/cron");
const passport = require('./config/passport');
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

// Security headers
app.use(helmet());

// Rate limiter for auth routes (15 requests per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { message: "Too many requests, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:5173', 
          'http://localhost:5174', 
          'http://localhost:3000', 
          'http://localhost:5001', 
          'https://algosforge.netlify.app', // Hardcoded production frontend
          process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(passport.initialize());

// Apply rate limiter to auth routes
app.use("/user", authLimiter, authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/study-plan", studyPlanRouter);
app.use("/user/auth", socialAuthRouter);
app.use("/cron", cronRouter);

// Keep-alive ping endpoint for cron-job.org
app.get("/ping", (req, res) => {
    res.status(200).send("pong");
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ 
        message: "Internal server error", 
        error: err.message,
        stack: err.stack 
    });
});

const InitializeConnection = async () => {
    try {
        // Connect to MongoDB (required)
        await main();
        console.log('DB Connected');

        app.listen(process.env.PORT, () => {
            console.log("Server listening at port number:" + process.env.PORT);
        });
    } catch (err) {
        console.error("Connection Error:", err);
    }
}

InitializeConnection();