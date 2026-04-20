const express = require('express');
const router = express.Router();
const { query } = require('../helpers/db');

// ================= CREATE POST =================
router.post('/', async (req, res) => {
  try {
    const { title, content, category, subcategory, topic, user_id, sources } = req.body;

    if (!title || !content || !category || !subcategory || !topic || !user_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // CATEGORY
    const cat = await query(
      'SELECT id FROM categories WHERE LOWER(name)=LOWER($1)',
      [category]
    );

    if (!cat.rows.length) {
      return res.status(400).json({ error: "Category not found" });
    }

    // SUBCATEGORY
    const sub = await query(
      'SELECT id FROM subcategories WHERE LOWER(name)=LOWER($1) AND category_id=$2',
      [subcategory, cat.rows[0].id]
    );

    if (!sub.rows.length) {
      return res.status(400).json({ error: "Subcategory not found" });
    }

    // TOPIC
    const top = await query(
      'SELECT id FROM topics WHERE LOWER(name)=LOWER($1) AND subcategory_id=$2',
      [topic, sub.rows[0].id]
    );

    if (!top.rows.length) {
      return res.status(400).json({ error: "Topic not found" });
    }

    // INSERT POST
    const post = await query(
      `INSERT INTO posts (title, content, topic_id, user_id, subcategory_id, sources)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [
        title,
        content,
        top.rows[0].id,
        user_id,
        sub.rows[0].id,
        sources || null
      ]
    );

    res.json({ id: post.rows[0].id });

  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ================= GET SINGLE POST =================
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT posts.*, users.username, users.profile_pic
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = result.rows[0];

    //ALWAYS return array (clean API)
    post.sources = post.sources
      ? post.sources.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    res.json(post);

  } catch (err) {
    console.error("GET POST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ================= GET POSTS BY TOPIC =================
router.get('/topic/:topicName', async (req, res) => {
  try {
    const result = await query(`
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
    console.error("GET POSTS BY TOPIC ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;