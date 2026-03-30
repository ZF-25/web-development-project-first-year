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

//START SERVER
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});