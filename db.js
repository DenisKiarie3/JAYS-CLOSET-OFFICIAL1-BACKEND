/* global process */ // ✅ Let ESLint know process is available

// server/db.js
import mysql from "mysql2";
import "dotenv/config"; // ✅ Load environment variables

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});
