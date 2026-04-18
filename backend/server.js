// Load environment variables from .env file
// (used for DATABASE_URL and other secrets)
require('dotenv').config();

// Import required packages
const express = require('express');      // Web framework for Node.js
const bcrypt = require('bcrypt');        // For hashing passwords securely
const cors = require('cors');            // Allows frontend to talk to backend
const multer = require('multer');        // Handles file uploads
const path = require('path');            // Helps with file paths
const { Pool } = require('pg');          // PostgreSQL client

// Create Express app
const app = express();


// ================= MIDDLEWARE =================

// Parse incoming JSON requests (req.body)
app.use(express.json());

// Enable Cross-Origin requests (frontend ↔ backend)
app.use(cors());

// Serve uploaded files publicly
// Example: http://localhost:3000/uploads/image.png
app.use('/uploads', express.static('uploads'));


// ================= MULTER (FILE UPLOAD SETUP) =================

// Configure where and how uploaded files are stored
const storage = multer.diskStorage({

  // Folder where files will be saved
  destination: (req, file, cb) => cb(null, 'uploads/'),

  // Rename file to avoid duplicates
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

// Create upload middleware using this storage
const upload = multer({ storage });


// ================= DATABASE =================

// Check if DATABASE_URL exists in .env
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1); // Stop server if not configured
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Required for services like Render / Railway (SSL connection)
  ssl: { rejectUnauthorized: false }
});

// Test database connection immediately when server starts
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Database connected:", res.rows[0]);
  } catch (err) {
    console.error("DB error:", err.message);
  }
})();


// ======================================================
// ================= AUTH (REGISTER & LOGIN) ============
// ======================================================

// REGISTER USER
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, dob } = req.body;

  // Validate input
  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    // Check if user already exists (same email OR username)
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email=$1 OR username=$2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before storing (IMPORTANT for security)
    const hashed = await bcrypt.hash(password, 10);

    // Insert new user into database
    const newUser = await pool.query(
      `INSERT INTO users (username,email,password,dob)
       VALUES ($1,$2,$3,$4)
       RETURNING id,username,email`,
      [username, email, hashed, dob]
    );

    // Send created user (without password)
    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  // identifier = email OR username
  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    // Find user by email OR username
    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1 OR username=$1',
      [identifier]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    // Send user data (NO password)
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ======================================================
// ================= POSTS ===============================
// ======================================================

// CREATE POST
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, category, subcategory, topic, user_id } = req.body;

    // Get category ID from name
    const cat = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name)=LOWER($1)',
      [category]
    );

    if (!cat.rows.length) return res.status(400).json({ error: 'Invalid category' });

    // Get subcategory ID (must belong to category)
    const sub = await pool.query(
      'SELECT id FROM subcategories WHERE LOWER(name)=LOWER($1) AND category_id=$2',
      [subcategory, cat.rows[0].id]
    );

    if (!sub.rows.length) return res.status(400).json({ error: 'Invalid subcategory' });

    // Get topic ID (must belong to subcategory)
    const top = await pool.query(
      'SELECT id FROM topics WHERE LOWER(name)=LOWER($1) AND subcategory_id=$2',
      [topic, sub.rows[0].id]
    );

    if (!top.rows.length) return res.status(400).json({ error: 'Invalid topic' });

    // Insert post
    const post = await pool.query(
      `INSERT INTO posts (title,content,topic_id,user_id,subcategory_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [title, content, top.rows[0].id, user_id, sub.rows[0].id]
    );

    res.json({ post_id: post.rows[0].id });

  } catch (err) {
    console.error("POST CREATE ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET POSTS BY TOPIC
app.get('/api/posts/topic/:topic', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.id, posts.title, posts.content,
              topics.name AS topic, users.username
       FROM posts
       JOIN users ON users.id = posts.user_id
       JOIN topics ON topics.id = posts.topic_id
       WHERE LOWER(topics.name)=LOWER($1)
       ORDER BY posts.id DESC`,
      [req.params.topic]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("FETCH POSTS ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ======================================================
// ================= USERS ===============================
// ======================================================

// GET USER BY ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id=$1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE PROFILE PICTURE
app.put('/api/users/profile-pic', upload.single('profile_pic'), async (req, res) => {
  try {
    const { user_id } = req.body;

    // Validate input
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Save filename in DB
    const result = await pool.query(
      'UPDATE users SET profile_pic=$1 WHERE id=$2 RETURNING *',
      [req.file.filename, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: 'Profile updated',
      filename: req.file.filename
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE USERNAME
app.put('/api/users/username', async (req, res) => {
  const { user_id, username } = req.body;

  try {
    await pool.query(
      'UPDATE users SET username=$1 WHERE id=$2',
      [username, user_id]
    );

    res.json({ message: "Username updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE EMAIL
app.put('/api/users/email', async (req, res) => {
  const { user_id, email } = req.body;

  try {
    await pool.query(
      'UPDATE users SET email=$1 WHERE id=$2',
      [email, user_id]
    );

    res.json({ message: "Email updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE PASSWORD
app.put('/api/users/password', async (req, res) => {
  const { user_id, newPassword } = req.body;

  try {
    // Hash new password before saving
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password=$1 WHERE id=$2',
      [hashed, user_id]
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE USER ACCOUNT
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: "Account deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ======================================================
// ================= BASIC DATA ==========================
// ======================================================

// GET ALL CATEGORIES
app.get('/categories', async (req, res) => {
  const data = await pool.query('SELECT * FROM categories');
  res.json(data.rows);
});

// GET SUBCATEGORIES BY CATEGORY
app.get('/subcategories/:id', async (req, res) => {
  const data = await pool.query(
    'SELECT * FROM subcategories WHERE category_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

// GET TOPICS BY SUBCATEGORY
app.get('/topics/:id', async (req, res) => {
  const data = await pool.query(
    'SELECT * FROM topics WHERE subcategory_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});


// ======================================================
// ================= START SERVER ========================
// ======================================================

// Start backend server on port 3000
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});