const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes below require a valid JWT
router.use(auth);

const MAX_LEN = 1000;

function validate(text) {
  if (typeof text !== "string" || !text.trim())
    return "Message cannot be empty";
  if (text.trim().length > MAX_LEN)
    return `Message cannot exceed ${MAX_LEN} characters`;
  return null;
}

// GET /api/messages -> only the logged-in user's messages
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, message, created_at, updated_at
         FROM message_tbl
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [req.userId],
    );
    res.json({ messages: rows });
  } catch (err) {
    console.error("list messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/messages
router.post("/", async (req, res) => {
  const error = validate(req.body?.message);
  if (error) return res.status(400).json({ message: error });

  try {
    const [result] = await pool.query(
      "INSERT INTO message_tbl (user_id, message) VALUES (?, ?)",
      [req.userId, req.body.message.trim()],
    );
    const [rows] = await pool.query(
      "SELECT id, message, created_at, updated_at FROM message_tbl WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error("create message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/messages/:id  -> user_id enforced in WHERE clause
router.put("/:id", async (req, res) => {
  const error = validate(req.body?.message);
  if (error) return res.status(400).json({ message: error });

  try {
    const [result] = await pool.query(
      "UPDATE message_tbl SET message = ? WHERE id = ? AND user_id = ?",
      [req.body.message.trim(), req.params.id, req.userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    const [rows] = await pool.query(
      "SELECT id, message, created_at, updated_at FROM message_tbl WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId],
    );
    res.json({ message: rows[0] });
  } catch (err) {
    console.error("update message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/messages/:id -> user_id enforced in WHERE clause
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM message_tbl WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("delete message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
