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


//TEST ROUTE
app.get('/', (req, res) => {
  res.send('Server is running');
});


//START SERVER
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});