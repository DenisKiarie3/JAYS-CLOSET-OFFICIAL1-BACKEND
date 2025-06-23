import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ This route is protected
router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to your dashboard!",
    user: req.user, // comes from the token
  });
});

export default router;
