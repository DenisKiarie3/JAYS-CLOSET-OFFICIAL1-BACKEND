// server/server.js
import express from "express";
import cors from "cors";
import { db } from "./db.js"; // ✅ Import database connection
import authRoutes from "./routes/auth.js";
import { products } from "./data/products.js"; // Sample product data
import dotenv from "dotenv";
dotenv.config(); // ✅ Loads environment variables from .env file
import protectedRoutes from "./routes/protected.js";


const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: [
    "https://jays-closet-official1.netlify.app", // ✅ production frontend
    "http://localhost:5173" // ✅ local dev environment
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use("/images", express.static("public/images")); // serve images if needed

// Routes
app.use("/api/auth", authRoutes);
app.get("/api/products", (req, res) => {
  res.json(products);
});
// ✅ Add protected routes here (after auth and public routes)
app.use("/api", protectedRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
