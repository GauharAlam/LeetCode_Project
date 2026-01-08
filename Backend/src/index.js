require("dotenv").config();
const express = require("express")
const app = express();
const main = require("./config/db");
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const cors = require("cors");

// FIXED CORS ISSUE: origin cannot be '*' when credentials is true
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);

const InitializeConnection = async () => {
    try {
        // Connect to MongoDB first (required)
        await main();
        console.log('DB Connected');

        // Try to connect to Redis (optional - server will work without it)
        try {
            await redisClient.connect();
            console.log('Redis Connected');
        } catch (redisErr) {
            console.warn('Redis connection failed (non-critical):', redisErr.message);
        }

        app.listen(process.env.PORT, () => {
            console.log("Server listening at port number:" + process.env.PORT);
        });
    } catch (err) {
        console.error("Connection Error:", err);
    }
}

InitializeConnection();