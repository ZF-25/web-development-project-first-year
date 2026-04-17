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
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
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

// Test DB
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Database connected:", res.rows[0]);
  } catch (err) {
    console.error("DB error:", err.message);
  }
})();

// ======================================================
// ================= AUTH ================================
// ======================================================

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, dob } = req.body;

  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email=$1 OR username=$2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username,email,password,dob)
       VALUES ($1,$2,$3,$4)
       RETURNING id,username,email`,
      [username, email, hashed, dob]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

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

    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================================================
// ================= POSTS ===============================
// ======================================================

// GET POST BY ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, topics.name AS topic
       FROM posts
       JOIN users ON users.id = posts.user_id
       LEFT JOIN topics ON topics.id = posts.topic_id
       WHERE posts.id = $1`,
      [req.params.id]
    );

    res.json(result.rows[0]);

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE POST (FIXED)
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, category, subcategory, topic, user_id } = req.body;

    // 1. Category
    const cat = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name)=LOWER($1)',
      [category]
    );

    if (!cat.rows.length) return res.status(400).json({ error: 'Invalid category' });

    // 2. Subcategory
    const sub = await pool.query(
      'SELECT id FROM subcategories WHERE LOWER(name)=LOWER($1) AND category_id=$2',
      [subcategory, cat.rows[0].id]
    );

    if (!sub.rows.length) return res.status(400).json({ error: 'Invalid subcategory' });

    // 3. Topic
    const top = await pool.query(
      'SELECT id FROM topics WHERE LOWER(name)=LOWER($1) AND subcategory_id=$2',
      [topic, sub.rows[0].id]
    );

    if (!top.rows.length) return res.status(400).json({ error: 'Invalid topic' });

    // 4. Insert post
    const post = await pool.query(
      `INSERT INTO posts (title,content,topic_id,user_id,subcategory_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [title, content, top.rows[0].id, user_id, sub.rows[0].id]
    );

    res.json({ post_id: post.rows[0].id });

  } catch (err) {
    console.error(err);
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

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================================================
// ================= USERS ===============================
// ======================================================

app.put('/api/users/profile-pic', upload.single('profile_pic'), async (req, res) => {
  const { user_id } = req.body;

  if (!req.file) return res.status(400).json({ message: "No file" });

  await pool.query(
    'UPDATE users SET profile_pic=$1 WHERE id=$2',
    [req.file.filename, user_id]
  );

  res.json({ message: 'Updated' });
});

app.get('/api/users/:id', async (req, res) => {
  const user = await pool.query(
    'SELECT * FROM users WHERE id=$1',
    [req.params.id]
  );

  res.json(user.rows[0]);
});

// ======================================================
// ================= BASIC ===============================
// ======================================================

app.get('/', (req, res) => {
  res.send('Server running');
});

app.get('/categories', async (req, res) => {
  const data = await pool.query('SELECT * FROM categories');
  res.json(data.rows);
});

app.get('/subcategories/:id', async (req, res) => {
  const data = await pool.query(
    'SELECT * FROM subcategories WHERE category_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

app.get('/topics/:id', async (req, res) => {
  const data = await pool.query(
    'SELECT * FROM topics WHERE subcategory_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

// ======================================================
// START
// ======================================================

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});