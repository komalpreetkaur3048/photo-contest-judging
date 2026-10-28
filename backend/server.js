import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import Contest from "./models/Contest.js";

// Import route files
import authRoutes from "./routes/authRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

// Import error middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
await connectDB();

// Automatically ensure all stored contest statuses match current dates
await Contest.syncContestStatusesInDB();

const app = express();

// Middleware: Enable CORS so frontend can communicate with backend
app.use(cors());

// Middleware: Body parser with 15MB limit for base64 photo submissions
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Serve Frontend statically so opening http://localhost:5001 directly loads the website
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "..", "Frontend");

app.use(express.static(frontendPath));

// API health check route
app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PhotoJudge API is running smoothly!",
        version: "1.0.0"
    });
});

// Mount Resource Routes
app.use("/api/auth", authRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/explore", exploreRoutes);

// Centralized 404 and Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});