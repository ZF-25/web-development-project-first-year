const express = require('express');
const router = express.Router();
const { query } = require('../helpers/db');

// CHECK
router.get('/check', async (req, res) => {
  const { user_id, post_id } = req.query;

  const result = await query(
    'SELECT 1 FROM favourites WHERE user_id=$1 AND post_id=$2',
    [user_id, post_id]
  );

  res.json({ isFavorited: result.rows.length > 0 });
});

// GET ALL
router.get('/:user_id', async (req, res) => {
  const result = await query(`
    SELECT posts.*, categories.name AS category,
           subcategories.name AS subcategory,
           topics.name AS topic
    FROM favourites
    JOIN posts ON favourites.post_id = posts.id
    JOIN subcategories ON posts.subcategory_id = subcategories.id
    JOIN categories ON subcategories.category_id = categories.id
    JOIN topics ON posts.topic_id = topics.id
    WHERE favourites.user_id = $1
  `, [req.params.user_id]);

  res.json(result.rows);
});

// ADD
router.post('/', async (req, res) => {
  const { user_id, post_id } = req.body;

  await query(
    'INSERT INTO favourites (user_id, post_id) VALUES ($1,$2)',
    [user_id, post_id]
  );

  res.json({ message: "Added" });
});

// REMOVE
router.post('/remove', async (req, res) => {
  const { user_id, post_id } = req.body;

  await query(
    'DELETE FROM favourites WHERE user_id=$1 AND post_id=$2',
    [user_id, post_id]
  );

  res.json({ message: "Removed" });
});

module.exports = router;