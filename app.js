// REQUIRED MODULES
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const db = require('./db/database');
const app = express();

// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public'))); // for CSS, JS, images etc.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secure-admin-portal-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// ENSURE UPLOADS DIRECTORY EXISTS
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MULTER CONFIG
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Add file type restrictions if needed
    cb(null, true);
  }
});

// INITIALIZE DATABASE AND CREATE ADMIN USERS
db.serialize(() => {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(
    "INSERT OR IGNORE INTO users (email, password, verified) VALUES (?, ?, ?)",
    ["martinez.135@newfaithministriesorg.faith", hashedPassword, 1],
    function(err) {
      if (err) {
        console.error('Error creating martinez admin:', err);
      } else if (this.changes > 0) {
        console.log('Created martinez admin user');
      }
    }
  );
  
  db.run(
    "INSERT OR IGNORE INTO users (email, password, verified) VALUES (?, ?, ?)",
    ["andrew.32@newfaithministriesorg.faith", hashedPassword, 1],
    function(err) {
      if (err) {
        console.error('Error creating andrew admin:', err);
      } else if (this.changes > 0) {
        console.log('Created andrew admin user');
      }
    }
  );
});

// ROUTES

// Serve login page at /login (instead of /views/login.html)
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Redirect root to /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// POST login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
    
    if (isJsonRequest) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    return res.status(400).send('Email and password are required.');
  }
  
  db.get("SELECT * FROM users WHERE email = ? AND verified = 1", [email], (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      
      const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
      if (isJsonRequest) {
        return res.status(500).json({ error: 'Database error occurred.' });
      }
      return res.status(500).send('Database error occurred.');
    }
    
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = {
        id: user.id,
        email: user.email,
        verified: user.verified
      };
      
      const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
      if (isJsonRequest) {
        return res.json({ success: true, redirect: '/dashboard' });
      }
      
      res.redirect('/dashboard');
    } else {
      const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
      if (isJsonRequest) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      
      res.status(401).send('Invalid email or password.');
    }
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// The rest of your routes (uploads, logout, forgot-password, reset-password) remain the same ...

// START SERVER
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
