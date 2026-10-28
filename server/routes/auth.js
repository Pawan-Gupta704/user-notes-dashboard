const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM user_tbl WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO user_tbl (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hash],
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };
    res.status(201).json({ token: signToken(user.id), user });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, password FROM user_tbl WHERE email = ?",
      [email.trim().toLowerCase()],
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const dbUser = rows[0];
    const ok = await bcrypt.compare(password, dbUser.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
    res.json({ token: signToken(user.id), user });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me  -> restore session from stored token
router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, created_at FROM user_tbl WHERE id = ?",
      [req.userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body || {};

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const [users] = await pool.query(
      "SELECT id FROM user_tbl WHERE email = ?",
      [email.trim().toLowerCase()],
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE user_tbl SET password = ? WHERE email = ?", [
      hash,
      email.trim().toLowerCase(),
    ]);

    res.json({ message: "Password updated successfully! You can now log in." });
  } catch (err) {
    console.error("forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
