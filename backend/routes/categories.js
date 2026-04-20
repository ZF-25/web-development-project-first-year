const express = require('express');
const router = express.Router();
const { query } = require('../helpers/db');

// CATEGORIES
router.get('/categories', async (req, res) => {
  const data = await query('SELECT * FROM categories');
  res.json(data.rows);
});

// SUBCATEGORIES
router.get('/subcategories/:id', async (req, res) => {
  const data = await query(
    'SELECT * FROM subcategories WHERE category_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

// TOPICS
router.get('/topics/:id', async (req, res) => {
  const data = await query(
    'SELECT * FROM topics WHERE subcategory_id=$1',
    [req.params.id]
  );
  res.json(data.rows);
});

module.exports = router;