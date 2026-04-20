const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../helpers/db');

// UPLOAD CONFIG
const uploadPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// GET USER
router.get('/:id', async (req, res) => {
  const result = await query(
    'SELECT id, username, email, profile_pic FROM users WHERE id=$1',
    [req.params.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result.rows[0]);
});

// PROFILE PIC
router.put('/profile-pic', upload.single('profile_pic'), async (req, res) => {
  const { user_id } = req.body;

  if (!user_id || !req.file) {
    return res.status(400).json({ error: "Missing data" });
  }

  const result = await query(
    'UPDATE users SET profile_pic=$1 WHERE id=$2 RETURNING profile_pic',
    [req.file.filename, user_id]
  );

  res.json({
    message: "Profile updated",
    filename: result.rows[0].profile_pic
  });
});

// USERNAME
router.put('/username', async (req, res) => {
  const { user_id, username } = req.body;

  await query(
    'UPDATE users SET username=$1 WHERE id=$2',
    [username, user_id]
  );

  res.json({ message: "Username updated" });
});

// EMAIL
router.put('/email', async (req, res) => {
  const { user_id, email } = req.body;

  await query(
    'UPDATE users SET email=$1 WHERE id=$2',
    [email, user_id]
  );

  res.json({ message: "Email updated" });
});

// PASSWORD
router.put('/password', async (req, res) => {
  const { user_id, newPassword } = req.body;

  const hashed = await bcrypt.hash(newPassword, 10);

  await query(
    'UPDATE users SET password=$1 WHERE id=$2',
    [hashed, user_id]
  );

  res.json({ message: "Password updated" });
});

// DELETE
router.delete('/:id', async (req, res) => {
  await query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ message: "Account deleted" });
});

module.exports = router;