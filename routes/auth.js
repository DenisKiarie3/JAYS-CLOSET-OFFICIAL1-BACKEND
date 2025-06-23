// server/routes/auth.js
import express from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // ⬅️ NEW: For creating tokens
import crypto from "crypto";
import nodemailer from "nodemailer";


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

// ✅ Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // 1. Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // 2. Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = results[0];

    // 3. Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // ✅ NEW: Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name }, // ✅ payload
      process.env.JWT_SECRET,                              // ✅ secret
      { expiresIn: "2h" }                                   // ✅ token expiry
    );


    // 4. If match → return success (optional: issue JWT)
    res.status(200).json({
      message: "Login successful",
      token, // ✅ Return token
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

// ✅ (Forgot password route)
// POST /api/auth/forgot-password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  db.query(
    "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
    [token, expiry, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "No user found with that email" });

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetUrl = `https://jays-closet-official1.netlify.app/reset-password/${token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset - JAYS-CLOSET",
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ error: "Failed to send email" });
        res.json({ message: "Reset email sent!" });
      });
    }
  );
});

// 4️⃣ ✅ Reset Password route (place this HERE)
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password is required" });

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(400).json({ error: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?",
        [hashedPassword, token],
        (err) => {
          if (err) return res.status(500).json({ error: "Error resetting password" });
          res.json({ message: "Password reset successful!" });
        }
      );
    }
  );
});


export default router;
