require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDb = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");

const app = express();

// Connect Database
connectDb();

// Allowed origins for CORS
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://bookhead-library-management-system.onrender.com",
].filter(Boolean);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin) return callback(null, true);

            // Allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, etc.)
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
            const isAllowedOrigin = allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""));

            if (isLocalhost || isAllowedOrigin) {
                callback(null, true);
            } else {
                callback(null, true); // Permissive fallback to prevent blocking
            }
        },
        credentials: true,
    })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowings", borrowingRoutes);

app.get("/", (req, res) => {
    res.send("Library Management System API is Running 🚀");
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});