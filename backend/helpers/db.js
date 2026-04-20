require('dotenv').config();
const { Pool } = require('pg');

/**
 * This file handles the connection to your PostgreSQL database.
 * It exports a `query()` function that the rest of your backend uses
 * to run SQL commands safely and easily.
 *
 * Using a separate file for DB logic keeps your code clean and organized.
 */


// ===============================
// SAFETY CHECK
// ===============================

/**
 * Make sure DATABASE_URL exists in the .env file.
 *
 * Why:
 * - Without DATABASE_URL, the server cannot connect to PostgreSQL.
 * - Instead of crashing later in the middle of a request,
 *   we stop the server immediately with a clear error message.
 */
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env");
  process.exit(1); // stop the server
}

// Optional debug message
/**
 * Shows which database the server is connecting to.
 * - Splitting at '@' hides the username/password part.
 * - This is helpful when deploying to Render or Railway.
 */
console.log("✅ DB connecting to:", process.env.DATABASE_URL.split('@')[1]);

// ===============================
// POOL
// ===============================

/**
 * Create a PostgreSQL connection pool.
 *
 * Why use a pool?
 * - It keeps multiple connections open.
 * - Faster than reconnecting every time.
 * - Automatically manages connection reuse.
 *
 * ssl: { rejectUnauthorized: false }
 * - Required for hosted PostgreSQL services (Render, Railway, Supabase, etc.)
 * - Allows secure connection even if the certificate is self‑signed.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===============================
// QUERY FUNCTION
// ===============================

/**
 * A helper function to run SQL queries.
 *
 * How it works:
 * - Accepts a SQL string and an optional array of values.
 * - Uses pool.query() to run the SQL safely.
 * - Returns the result (rows, rowCount, etc.)
 *
 * Why this is useful:
 * - Prevents SQL injection by using parameterized queries.
 * - Keeps your route files clean and readable.
 * - Centralizes error handling.
 *
 * Example usage:
 *   const result = await query("SELECT * FROM users WHERE id=$1", [userId]);
 *   console.log(result.rows);
 */
const query = async (sql, values = []) => {
  try {
    const result = await pool.query(sql, values);
    return result;
  } catch (err) {
    console.error("DB ERROR:", err.message);
    throw err; // rethrow so routes can handle it
  }
};

// ===============================
// EXPORT
// ===============================

/**
 * Export the query function so other files can use it.
 */
module.exports = { query };