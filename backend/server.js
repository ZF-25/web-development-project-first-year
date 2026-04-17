require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ================= DATABASE =================
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test DB connection
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ Database connected:", res.rows[0]);
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
})();

// ======================================================
// ================= AUTH APIs ===========================
// ======================================================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, dob } = req.body;

  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, dob)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email`,
      [username, email, hashedPassword, dob]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_pic: user.profile_pic
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================================================
// ================= POSTS ===============================
// ======================================================

// GET POST BY ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_pic
       FROM posts
       JOIN users ON users.id = posts.user_id
       WHERE posts.id = $1`,
      [req.params.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE POST
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, category, subcategory, topic, references, user_id } = req.body;

    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const subcategoryResult = await pool.query(
      'SELECT id FROM subcategories WHERE LOWER(name) = LOWER($1) AND category_id = $2',
      [subcategory, categoryResult.rows[0].id]
    );

    if (subcategoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid subcategory' });
    }

    const postResult = await pool.query(
      `INSERT INTO posts (title, content, topic, user_id, subcategory_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [title, content, topic, user_id, subcategoryResult.rows[0].id]
    );

    const post_id = postResult.rows[0].id;

    if (references) {
      await pool.query(
        `INSERT INTO files (post_id, file_url)
         VALUES ($1, $2)`,
        [post_id, references]
      );
    }

    res.json({ message: 'Post created successfully', post_id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET POSTS BY TOPIC
app.get('/api/posts/topic/:topic', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.id, posts.title, posts.content, posts.topic,
              users.username, users.profile_pic
       FROM posts
       JOIN users ON users.id = posts.user_id
       WHERE LOWER(posts.topic) = LOWER($1)
       ORDER BY posts.id DESC`,
      [req.params.topic]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================================================
// ================= USERS ===============================
// ======================================================

// UPDATE PROFILE PIC
app.put('/api/users/profile-pic', upload.single('profile_pic'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { user_id } = req.body;

  await pool.query(
    'UPDATE users SET profile_pic = $1 WHERE id = $2',
    [req.file.filename, user_id]
  );

  res.json({ message: 'Profile picture updated' });
});

// GET USER
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );

    res.json(user.rows[0]);

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================================================
// ================= BASIC ROUTES ========================
// ======================================================

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY id');
  res.json(result.rows);
});

app.get('/subcategories/:categoryId', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM subcategories WHERE category_id = $1',
    [req.params.categoryId]
  );
  res.json(result.rows);
});

app.get('/topics/:subcategoryId', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM topics WHERE subcategory_id = $1',
    [req.params.subcategoryId]
  );
  res.json(result.rows);
});

// ======================================================
// START SERVER
// ======================================================

app.listen(3000, () => {
  console.log(' Server running on http://localhost:3000');
});