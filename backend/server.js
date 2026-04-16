// Related to multer:
const multer = require('multer');
const path = require('path');

const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // save the uploaded profile pictures in the "uploads" folder and serve them statically


//DATABASE CONNECTION
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'brainworm',
  password: 'KdRn@19920929',
  port: 5432,
});

//Test DB connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected');
  }
});




// ======================================================
// ================= AUTH APIs ===========================
// ======================================================
// Handles: Register, Login
//REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, dob } = req.body;

  // Basic validation
  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user alraedy exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
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
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


//LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  // Basic validation
  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    //Find user by email OR username
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Send safe user data only (no password)
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
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});





// ======================================================
// ================= CATEGORIES APIs =====================
// ======================================================
// Handles: Main categories (Natural Science, etc.)




// ======================================================
// ================= SUBCATEGORIES APIs ==================
// ======================================================
// Handles: Physics, Biology, Mathematics, etc.




// ======================================================
// ================= TOPICS APIs =========================
// ======================================================
// Handles: Mechanics, Thermodynamics, etc.
// (Stored inside POSTS table as "topic")




// ======================================================
// ================= POSTS APIs ==========================
// ======================================================
// Handles: Notes / posts




// ======================================================
// ================= RATINGS APIs ========================
// ======================================================
// Handles: Rating system (1–5 stars)




// ======================================================
// ================= FILES APIs ==========================
// ======================================================
// Handles: References / uploads
app.post('/api/posts', async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      subcategory,
      topic,
      references,
      user_id
    } = req.body;

    // ✅ VALIDATION
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    // 1. Category
    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const category_id = categoryResult.rows[0].id;

    // 2. Subcategory
    const subcategoryResult = await pool.query(
      'SELECT id FROM subcategories WHERE LOWER(name) = LOWER($1) AND category_id = $2',
      [subcategory, category_id]
    );

    if (subcategoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid subcategory' });
    }

    const subcategory_id = subcategoryResult.rows[0].id;

    // 3. Insert post
    const postResult = await pool.query(
      `INSERT INTO posts (title, content, topic, user_id, subcategory_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [title, content, topic, user_id, subcategory_id]
    );

    const post_id = postResult.rows[0].id;

    // 4. Save references
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

// NEW API to fetch posts by topic *******************
app.get('/api/posts/topic/:topic', async (req, res) => {
  try {
    const { topic } = req.params;

    const result = await pool.query(
      `
      SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.topic,
        users.username,
        users.profile_pic
      FROM posts
      JOIN users ON users.id = posts.user_id
      WHERE LOWER(posts.topic) = LOWER($1)
      ORDER BY posts.id DESC
      `,
      [topic]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ======================================================
// ================= FAVOURITES APIs =====================
// ======================================================
// Handles: Saved posts (Library feature)




// ======================================================
// ================= USER SETTINGS APIs ==================
// ======================================================
// Handles: Profile updates
// 1. Update profile picture
  app.put('/api/users/profile-pic', upload.single('profile_pic'), async (req, res) => {
  const { user_id, username } = req.body;

  //CHECK IF FILE EXISTS
  if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.filename;

  await pool.query(
    'UPDATE users SET profile_pic = $1 WHERE id = $2',
    [filePath, user_id]
  );

  res.json({ message: 'Profile picture updated' });
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );

    res.json(user.rows[0]);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});




  // 2. Update username
  app.put('/api/users/username', async (req, res) => {
  try {
    const { user_id, username } = req.body;

    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
      [username, user_id]
    );

    res.json({ message: 'Username updated', user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


  // 3. Update email
  app.put('/api/users/email', async (req, res) => {
  try {
    const { user_id, email } = req.body;

    const result = await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING *',
      [email, user_id]
    );

    res.json({ message: 'Email updated', user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


  // 4. Update password
  app.put('/api/users/password', async (req, res) => {
  try {
    const { user_id, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, user_id]
    );

    res.json({ message: 'Password updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


  // 5. Delete account
  app.delete('/api/users/:id', async (req, res) => {
  try {
    const user_id = req.params.id;

    await pool.query('DELETE FROM users WHERE id = $1', [user_id]);

    res.json({ message: 'Account deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});






// ======================================================
//TEST ROUTE
app.get('/', (req, res) => {
  res.send('Server is running');
});
// ===============================
//  GET ALL CATEGORIES
// ===============================
app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching categories');
  }
});

// ===============================
//  GET SUBCATEGORIES BY CATEGORY
// ===============================
app.get('/subcategories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(
      'SELECT * FROM subcategories WHERE category_id = $1 ORDER BY id',
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching subcategories');
  }
});

// ===============================
//  GET TOPICS BY SUBCATEGORY
// ===============================
app.get('/topics/:subcategoryId', async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const result = await pool.query(
      'SELECT * FROM topics WHERE subcategory_id = $1 ORDER BY id',   // ← ИСПРАВЛЕНО
      [subcategoryId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("error fetching topics:", err);
    res.status(500).send('Error fetching topics');
  }
});

// ======================================================
//START SERVER
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});