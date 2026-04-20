const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../helpers/db');

/**
 * This file handles:
 * - User registration
 * - User login
 *
 * It communicates with the database using the `query()` helper,
 * and uses bcrypt to hash and compare passwords.
 */

// ===============================
// REGISTER ROUTE
// ===============================

/**
 * POST /register
 *
 * What this route does:
 * 1. Validates required fields.
 * 2. Checks if the username or email already exists.
 * 3. Hashes the password using bcrypt.
 * 4. Inserts the new user into the database.
 * 5. Returns the created user (without password).
 */
router.post('/register', async (req, res) => {
  const { username, email, password, dob } = req.body;

  // Basic validation
  if (!username || !email || !password || !dob) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    /**
     * Check if a user already exists with the same email or username.
     * - $1 and $2 are placeholders to prevent SQL injection.
     */
    const existing = await query(
      'SELECT * FROM users WHERE email=$1 OR username=$2',
      [email, username]
    );

    // If any row is returned, the user already exists
    if (existing.rows.length) {
      return res.status(400).json({ message: 'User already exists' });
    }

    /**
     * Hash the password before saving it.
     * - bcrypt.hash(password, 10)
     *   → "10" is the salt rounds (strength of hashing)
     */
    const hashed = await bcrypt.hash(password, 10);

    /**
     * Insert the new user into the database.
     * RETURNING lets us get the inserted row immediately.
     */
    const user = await query(
      `INSERT INTO users (username,email,password,dob)
       VALUES ($1,$2,$3,$4)
       RETURNING id,username,email`,
      [username, email, hashed, dob]
    );

     // Send back the created user (safe fields only)
    res.status(201).json(user.rows[0]);

  } catch (err) {
    // If something unexpected happens
    res.status(500).json({ message: 'Server error' });
  }
});

// ===============================
// LOGIN ROUTE
// ===============================

/**
 * POST /login
 *
 * What this route does:
 * 1. Accepts identifier (email or username) + password.
 * 2. Looks up the user by email OR username.
 * 3. Compares the provided password with the hashed password in DB.
 * 4. If correct → return user info.
 * 5. If wrong → return error message.
 */
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    /**
     * Look for a user whose email OR username matches the identifier.
     * - This allows login with either email or username.
     */
    const result = await query(
      'SELECT * FROM users WHERE email=$1 OR username=$1',
      [identifier]
    );

    // If no user found
    if (!result.rows.length) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    /**
     * Compare the provided password with the hashed password in DB.
     * - bcrypt.compare() returns true if they match.
     */
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    /**
     * Login successful!
     * Return safe user data (never return password).
     */
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===============================
// EXPORT ROUTER
// ===============================

/**
 * Export the router so server.js can use it.
 */
module.exports = router;