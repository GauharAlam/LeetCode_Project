require("dotenv").config();
const express = require("express")
const app = express();
const main = require("./config/db");
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const studyPlanRouter = require("./routes/studyPlan");
const cors = require("cors");

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:5173', 
          'http://localhost:5174', 
          'http://localhost:3000', 
          'http://localhost:5001', 
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
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/study-plan", studyPlanRouter);

// Keep-alive ping endpoint for cron-job.org
app.get("/ping", (req, res) => {
    res.status(200).send("pong");
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