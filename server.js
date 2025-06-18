// server/server.js
import express from "express";
import cors from "cors";
import { products } from "./data/products.js"; // Sample product data

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images")); // serve images if needed

// Routes
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
