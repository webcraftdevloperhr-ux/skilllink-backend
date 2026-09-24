const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillLink Backend is running "
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log("MONGODB_URI is not configured.");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("MongoDB connected successfully.");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}

app.listen(PORT, () => {
  console.log(`SkillLink Backend running on port ${PORT}`);
});