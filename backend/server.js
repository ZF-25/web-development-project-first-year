console.log("SERVER FILE LOADED"); // This line just logs to the console when the server file is loaded

// Loads environment variables from a .env file (like DATABASE_URL)
require('dotenv').config();

// Import required packages
const express = require('express'); // Web server framework
const bcrypt = require('bcrypt'); // For hashing passwords securely
const cors = require('cors'); // Allows frontend to connect to backend
const multer = require('multer'); // Handles file uploads
const path = require('path'); // Helps with file paths
const fs = require('fs'); // File system module (create folders, etc.)
const { Pool } = require('pg'); // PostgreSQL database connection

// Create the Express app
const app = express();

// ================= MIDDLEWARE =================
// Allows the server to read JSON data from requests (req.body)
app.use(express.json());

// Configure CORS so frontend (localhost:5500) can access backend
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true  // Allows cookies/auth headers if needed
}));


// ================= FILE UPLOAD =================

// Define folder where uploaded files will be stored
const uploadPath = path.join(__dirname, 'uploads');

// If the folder doesn't exist, create it
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Make uploaded files publicly accessible via /uploads URL
app.use('/uploads', express.static(uploadPath));

// Configure how files are stored
const storage = multer.diskStorage({
  // Where to save files
  destination: (req, file, cb) => cb(null, uploadPath),
  // Rename file (timestamp + original extension)
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
// Create upload handler
const upload = multer({ storage });

// ================= DATABASE =================

// If DATABASE_URL is missing, stop the server
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

// Create connection pool to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection immediately when server starts
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("DB connected:", res.rows[0]);
  } catch (err) {
    console.error("DB error:", err.message);
  }
})();

// ======================================================
// ================= AUTH ===============================
// ======================================================

// REGISTER USER
app.post('/api/auth/register', async (req, res) => {
  // Extract user data from request body
  const { username, email, password, dob } = req.body;
  // Check if any field is missing
  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    // Check if user already exists (same email OR username)
    const existing = await pool.query(
      'SELECT * FROM users WHERE email=$1 OR username=$2',
      [email, username]
    );

    if (existing.rows.length) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password (never store plain passwords!)
    const hashed = await bcrypt.hash(password, 10);

    // Insert new user into database
    const newUser = await pool.query(
      `INSERT INTO users (username,email,password,dob)
       VALUES ($1,$2,$3,$4)
       RETURNING id,username,email`,
      [username, email, hashed, dob]
    );

    // Send back created user info
    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1 OR username=$1',
      [identifier]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    // Return user data (no password!)
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
// ================= USERS ===============================
// ======================================================

// GET USER BY ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, profile_pic FROM users WHERE id=$1',
      [req.params.id]
    );

    // If user not found
    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
// ================= USERS UPDATE ========================
// ======================================================

// UPDATE PROFILE PIC
app.put('/api/users/profile-pic', upload.single('profile_pic'), async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await pool.query(
      'UPDATE users SET profile_pic=$1 WHERE id=$2 RETURNING profile_pic',
      [req.file.filename, user_id]
    );

    res.json({
      message: "Profile picture updated",
      filename: result.rows[0].profile_pic
    });

  } catch (err) {
    console.error("PROFILE PIC ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE USERNAME
app.put('/api/users/username', async (req, res) => {
  try {
    const { user_id, username } = req.body;

    if (!user_id || !username) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(
      'UPDATE users SET username=$1 WHERE id=$2',
      [username, user_id]
    );

    res.json({ message: "Username updated" });

  } catch (err) {
    console.error("USERNAME ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE EMAIL
app.put('/api/users/email', async (req, res) => {
  try {
    const { user_id, email } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(
      'UPDATE users SET email=$1 WHERE id=$2',
      [email, user_id]
    );

    res.json({ message: "Email updated" });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE PASSWORD
app.put('/api/users/password', async (req, res) => {
  try {
    const { user_id, newPassword } = req.body;

    if (!user_id || !newPassword) {
      return res.status(400).json({ error: "Missing data" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password=$1 WHERE id=$2',
      [hashed, user_id]
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error("PASSWORD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE ACCOUNT
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM users WHERE id=$1', [id]);

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
// ================= POSTS ===============================
// ======================================================

// CREATE POST 
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, category, subcategory, topic, user_id } = req.body;

    if (!title || !content || !category || !subcategory || !topic || !user_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const cat = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name)=LOWER($1)',
      [category]
    );

    const sub = await pool.query(
      'SELECT id FROM subcategories WHERE LOWER(name)=LOWER($1) AND category_id=$2',
      [subcategory, cat.rows[0].id]
    );

    const top = await pool.query(
      'SELECT id FROM topics WHERE LOWER(name)=LOWER($1) AND subcategory_id=$2',
      [topic, sub.rows[0].id]
    );

    const post = await pool.query(
      `INSERT INTO posts (title, content, topic_id, user_id, subcategory_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [title, content, top.rows[0].id, user_id, sub.rows[0].id]
    );

    res.json({ id: post.rows[0].id });

  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET POSTS BY TOPIC
app.get('/api/posts/topic/:topicName', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.id, posts.title, posts.content, posts.created_at,
             users.username, users.profile_pic
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      JOIN topics ON posts.topic_id = topics.id
      WHERE LOWER(topics.name) = LOWER($1)
      ORDER BY posts.created_at DESC
    `, [req.params.topicName]);

    res.json(result.rows);

  } catch (err) {
    console.error("TOPIC POSTS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET SINGLE POST
app.get('/api/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, users.username, users.profile_pic
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("POST FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
// ================= FAVORITES ===========================
// ======================================================

// CHECK favorite (MUST BE FIRST)
app.get('/api/favorites/check', async (req, res) => {
  try {
    const { user_id, post_id } = req.query;

    if (!user_id || !post_id) {
      return res.status(400).json({ error: "Missing params" });
    }

    const result = await pool.query(
      'SELECT 1 FROM favourites WHERE user_id=$1 AND post_id=$2',
      [user_id, post_id]
    );

    res.json({ isFavorited: result.rows.length > 0 });

  } catch (err) {
    console.error("CHECK FAVORITE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET favorites (FIXED WITH CATEGORY DATA)
app.get('/api/favorites/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const result = await pool.query(`
      SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.created_at,
        categories.name AS category,
        subcategories.name AS subcategory,
        topics.name AS topic
      FROM favourites
      JOIN posts ON favourites.post_id = posts.id
      JOIN subcategories ON posts.subcategory_id = subcategories.id
      JOIN categories ON subcategories.category_id = categories.id
      JOIN topics ON posts.topic_id = topics.id
      WHERE favourites.user_id = $1
      ORDER BY posts.created_at DESC
    `, [user_id]);

    res.json(result.rows);

  } catch (err) {
    console.error("GET FAVORITES ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ADD favorite (prevents duplicates)
app.post('/api/favorites', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;

    if (!user_id || !post_id) {
      return res.status(400).json({ error: "Missing data" });
    }

    // Prevent duplicate favorites
    const exists = await pool.query(
      'SELECT 1 FROM favourites WHERE user_id=$1 AND post_id=$2',
      [user_id, post_id]
    );

    if (exists.rows.length) {
      return res.json({ message: "Already in favorites" });
    }

    await pool.query(
      'INSERT INTO favourites (user_id, post_id) VALUES ($1,$2)',
      [user_id, post_id]
    );

    res.json({ message: "Added to favorites" });

  } catch (err) {
    console.error("ADD FAVORITE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// REMOVE favorite
app.post('/api/favorites/remove', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;

    if (!user_id || !post_id) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(
      'DELETE FROM favourites WHERE user_id=$1 AND post_id=$2',
      [user_id, post_id]
    );

    res.json({ message: "Removed from favorites" });

  } catch (err) {
    console.error("REMOVE FAVORITE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
// ================= CATEGORIES (FIX) ====================
// ======================================================

app.get('/api/categories', async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM categories');
    res.json(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/subcategories/:id', async (req, res) => {
  const data = await pool.query(
    'SELECT * FROM subcategories WHERE category_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

app.get('/api/topics/:id', async (req, res) => {
  const data = await pool.query(
    'SELECT * FROM topics WHERE subcategory_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

// ======================================================
// ================= DEBUG ===============================
// ======================================================

app.get('/test', (req, res) => {
  res.send("Server working");
});

// ======================================================
// ================= START SERVER ========================
// ======================================================

// Use PORT from environment OR default to 3000
const PORT = process.env.PORT || 3000;

// Start server and listen for requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});