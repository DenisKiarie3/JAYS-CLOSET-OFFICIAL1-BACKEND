// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// ✅ Middleware to verify JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // 🔐 Token is sent as: Authorization: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to the request
    next(); // proceed to the next middleware/route
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}
