const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbDir = path.dirname(__filename);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const dbPath = path.join(__dirname, 'admin_portal.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    verify_token TEXT,
    token_expires INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });
  
  // Uploads table
  db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by TEXT,
    file_size INTEGER,
    mime_type TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating uploads table:', err);
    } else {
      console.log('Uploads table ready');
    }
  });
  
  // Add indexes for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_verify_token ON users(verify_token)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by ON uploads(uploaded_by)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = db;