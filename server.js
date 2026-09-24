const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

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
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// CREATE USER
app.post("/api/users/create", async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      role,
      mobile,
      email
    } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, username, password and role are required."
      });
    }

    const allowedRoles = ["CEO", "ADMIN", "PARTNER", "CLIENT"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role."
      });
    }

    const existingUser = await User.findOne({
      username: username.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      role,
      mobile: mobile || "",
      email: email || ""
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user."
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    const user = await User.findOne({
      username: username.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "This account is inactive."
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed."
    });
  }
});

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log("MONGODB_URI is not configured.");
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("MongoDB connected successfully.");
    })
    .catch((error) => {
      console.error(
        "MongoDB connection failed:",
        error.message
      );
    });
}

app.listen(PORT, () => {
  console.log(`SkillLink Backend running on port ${PORT}`);
});