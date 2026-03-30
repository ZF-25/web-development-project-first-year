const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(cors());

// DB connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'brainworm',
  password: 'postgres',
  port: 5432,
});

// test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});