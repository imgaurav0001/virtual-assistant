import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

// Proper CORS setup
app.use(cors({
    // We will update the origin after deploying the frontend
    origin: ["http://localhost:5173", "https://your-live-frontend-url.vercel.app"],
    credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! 🚀");
});


// --- START OF DEPLOYMENT-SAFE CODE ---
// This part checks if the code is running on Vercel.
// If not on Vercel (i.e., on your local machine), it will start the server.
if (process.env.VERCEL_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running locally on port ${PORT}`);
    });
}

// Export the app for Vercel's serverless environment
export default app;
// --- END OF DEPLOYMENT-SAFE CODE ---