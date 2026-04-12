const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(cors());

//DATABASE CONNECTION
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'brainworm',
  password: 'postgres',
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

  // Validation
  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check existing user
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
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

  // Validation
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

    // Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Send safe user data only
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
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




// ======================================================
// ================= FAVOURITES APIs =====================
// ======================================================
// Handles: Saved posts (Library feature)




// ======================================================
// ================= USER SETTINGS APIs ==================
// ======================================================
// Handles: Profile updates





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