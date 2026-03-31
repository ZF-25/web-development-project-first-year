-- DATABASE SETUP
-- Create database manually in pgAdmin:
-- CREATE DATABASE brainworm;

-- USERS
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password TEXT NOT NULL,
dob DATE,
profile_pic TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL
);

-- SUBCATEGORIES
CREATE TABLE subcategories (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
);

-- POSTS
CREATE TABLE posts (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
content TEXT NOT NULL,
topic VARCHAR(100), -- e.g., Mechanics, Thermodynamics
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RATINGS
CREATE TABLE ratings (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- FILES (REFERENCES)
CREATE TABLE files (
id SERIAL PRIMARY KEY,
post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
file_url TEXT NOT NULL
);

-- FAVOURITES
CREATE TABLE favourites (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE
);

-- ================= SAMPLE DATA =================

-- Categories
INSERT INTO categories (name) VALUES
('Natural Science'),
('Formal Science'),
('Applied Science'),
('Social Science'),
('Humanities'),
('Languages');

-- Subcategories
INSERT INTO subcategories (name, category_id) VALUES
('Physics', 1),
('Biology', 1),
('Chemistry', 1),
('Geology', 1),
('Astronomy', 1),
('Mathematics', 2),
('Logic', 2),
('Statistics', 2),
('Engineering & IT', 3),
('Environmental Science', 3),
('Medical & Health', 3),
('Agriculture', 3),
('Psychology', 4),
('Sociology', 4),
('Economics', 4),
('Political Science', 4),
('Philosophy', 5),
('History', 5),
('Religion', 5),
('Ethics', 5),
('Arts', 5),
('English', 6),
('Finnish', 6),
('Spanish', 6),
('Chinese', 6);

-- NOTES
-- "Topics" (e.g., Mechanics, Thermodynamics) are stored inside POSTS as 'topic'.
-- Do NOT create a separate topics table.
