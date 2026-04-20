console.log("SERVER FILE LOADED");

// ===============================
// ENV
// ===============================

/**
 * Loads environment variables from a .env file into process.env.
 *
 * Why this matters:
 * - You can store sensitive values (like database URLs, API keys, JWT secrets)
 *   in a .env file instead of hardcoding them.
 * - Keeps your code cleaner and more secure.
 */
require('dotenv').config();

// ===============================
// IMPORTS
// ===============================

/**
 * express  → main web server framework
 * cors     → allows frontend + backend to communicate safely
 * path     → helps build file paths in a safe way
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

// ===============================
// APP INIT
// ===============================

/**
 * Create the Express application.
 * This "app" object will handle routes, middleware, and server logic.
 */
const app = express();

// ===============================
// MIDDLEWARE
// ===============================

/**
 * express.json():
 * - Allows the server to read JSON sent in requests.
 * - Without this, req.body would be undefined.
 */
app.use(express.json());

/**
 * cors():
 * - Allows your frontend (HTML/JS) to talk to your backend.
 * - origin: true → allows all origins (useful for development)
 * - methods → allowed HTTP methods
 * - credentials → allows cookies/auth headers if needed
 */
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ===============================
// STATIC FILES
// ===============================

/**
 * Serve uploaded files (like profile pictures).
 * Example:
 *   http://localhost:3000/uploads/myphoto.jpg
 */
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

/**
 * Serve your frontend files (HTML, CSS, JS).
 * This makes your backend act like a full website host.
 *
 * Example:
 *   http://localhost:3000/login.html
 *   http://localhost:3000/home.html
 */
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ===============================
// ROUTES (MODULAR)
// ===============================

/**
 * These lines connect your route files to the server.
 *
 * Example:
 * - /api/auth/login → handled by routes/auth.js
 * - /api/users/...  → handled by routes/users.js
 *
 * This keeps your server clean and organized.
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api', require('./routes/categories'));

// ===============================
// DEBUG ROUTE
// ===============================

/**
 * Simple test route to confirm the server is running.
 * Visit:
 *   http://localhost:3000/test
 */
app.get('/test', (req, res) => {
  res.send("Server working");
});

// ===============================
// API 404 HANDLER
// ===============================

/**
 * If a request starts with /api but doesn't match any route above,
 * this will catch it and return a JSON 404 error.
 *
 * Example:
 *   GET /api/unknown → { error: "API route not found" }
 */
app.use('/api', (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ===============================
// FRONTEND FALLBACK
// ===============================

/**
 * If the user visits ANY route that is not an API route
 * and not a static file, send them the landing page.
 *
 * This is useful for:
 * - Single Page Applications (SPA)
 * - Handling unknown frontend routes
 */
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'landingPage.html'));
});

// ===============================
// START SERVER
// ===============================

/**
 * Start the server on the given port.
 * - Uses PORT from .env if available.
 * - Otherwise defaults to 3000.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});