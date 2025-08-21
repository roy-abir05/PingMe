const express = require("express");
const router = express.Router();
const validator = require("validator");
const User = require("../models/user");
const { signToken } = require("../utils/jwt");
const authMiddleware = require("../middleware/auth");

const sanitize = (s) => (typeof s === "string" ? s.trim() : s);

router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    username = sanitize(username);
    email = sanitize(email)?.toLowerCase();
    password = sanitize(password);

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email, password required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 chars" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(409)
        .json({ error: "Username or email already in use" });
    }

    const user = await User.create({ username, email, password });

    const token = signToken({ id: user._id.toString(), userId: user.userId });

    const userDTO = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.status(201).json({ user: userDTO, token });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { emailOrUsername, password } = req.body;
    emailOrUsername = sanitize(emailOrUsername)?.toLowerCase();
    password = sanitize(password);

    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ error: "emailOrUsername and password required" });
    }

    const query = validator.isEmail(emailOrUsername)
      ? { email: emailOrUsername }
      : { username: emailOrUsername };

    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: user._id.toString(), userId: user.userId });

    const userDTO = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      online: user.online,
      typing: user.typing,
      createdAt: user.createdAt,
    };

    return res.json({ user: userDTO, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userDTO = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      online: user.online,
      typing: user.typing,
      createdAt: user.createdAt,
    };
    res.json(userDTO);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
