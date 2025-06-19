// server/routes/auth.js
import express from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// ✅ Sign-up route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if all fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // 2. Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.status(409).json({ error: "User already exists." });
      }

      // 3. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Insert new user
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Failed to register user." });

          res.status(201).json({ message: "User registered successfully!" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
