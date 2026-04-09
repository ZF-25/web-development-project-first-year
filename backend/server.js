const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(cors());

// DB CONNECTION
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'brainworm',
  password: 'postgres',
  port: 5432,
});

// TEST DATABASE CONNECTION
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB error:', err);
  } else {
    console.log('Database connected');
  }
});

// TEST ROUTE
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
      'SELECT * FROM topics WHERE subcategory_id = $1 ORDER BY id',
      [subcategoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching topics');
  }
});

//START SERVER
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});