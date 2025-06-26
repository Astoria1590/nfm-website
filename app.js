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
app.use(express.static('public'));
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
  // Create admin users (only if they don't exist)
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
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    // Check if it's an AJAX request (JSON content type)
    const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
    
    if (isJsonRequest) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    return res.status(400).send('Email and password are required.');
  }
  
  console.log('Login attempt for:', email);
  
  db.get("SELECT * FROM users WHERE email = ? AND verified = 1", [email], (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      
      const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
      if (isJsonRequest) {
        return res.status(500).json({ error: 'Database error occurred.' });
      }
      return res.status(500).send('Database error occurred.');
    }
    
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = {
        id: user.id,
        email: user.email,
        verified: user.verified
      };
      console.log('Login successful for:', email);
      
      const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
      if (isJsonRequest) {
        return res.json({ success: true, redirect: '/dashboard' });
      }
      
      // For form submissions, redirect normally
      res.redirect('/dashboard');
    } else {
      console.log('Invalid credentials for:', email);
      console.log('User exists:', !!user);
      if (user) {
        console.log('Password check result:', bcrypt.compareSync(password, user.password));
      }
      
      const isJsonRequest = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
      if (isJsonRequest) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      
      res.status(401).send('Invalid email or password.');
    }
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// API endpoint to get user info
app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// API endpoint to get uploads
app.get('/api/uploads', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  db.all("SELECT * FROM uploads ORDER BY uploaded_at DESC", (err, uploads) => {
    if (err) {
      console.error('Error fetching uploads:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ uploads });
  });
});

app.post('/upload', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Please log in to upload files.');
  }
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).send('Upload failed: ' + err.message);
    }
    
    if (!req.file) {
      return res.status(400).send('No file selected.');
    }
    
    const file = req.file;
    const timestamp = new Date().toISOString();
    
    db.run(
      "INSERT INTO uploads (filename, filepath, uploaded_at, uploaded_by) VALUES (?, ?, ?, ?)",
      [file.originalname, file.path, timestamp, req.session.user.email],
      function(err) {
        if (err) {
          console.error('Database error during upload:', err);
          return res.status(500).send('Database error occurred.');
        }
        console.log('File uploaded successfully:', file.originalname);
        res.send('Upload successful!');
      }
    );
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// FORGOT PASSWORD
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forgot-password.html'));
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).send('Email is required.');
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour expiration
  
  db.run(
    "UPDATE users SET verify_token = ?, token_expires = ? WHERE email = ?", 
    [token, expires, email], 
    function (err) {
      if (err) {
        console.error('Database error during password reset:', err);
        return res.status(500).send('Database error occurred.');
      }
      
      if (this.changes === 0) {
        return res.status(404).send('No account found with that email address.');
      }
      
      const resetLink = `http://localhost:5500/reset-password?token=${token}`;
      
      // Configure your email settings here
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your_email@gmail.com',
          pass: process.env.EMAIL_PASS || 'your_app_password'
        }
      });
      
      const mailOptions = {
        from: 'New Faith Ministries <' + (process.env.EMAIL_USER || 'your_email@gmail.com') + '>',
        to: email,
        subject: 'Reset your password - New Faith Ministries',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your New Faith Ministries admin account.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        `
      };
      
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Email error:', err);
          return res.status(500).send('Error sending email. Please try again.');
        }
        res.send('Password reset link sent! Check your email.');
      });
    }
  );
});

app.get('/reset-password', (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(400).send('Reset token is required.');
  }
  
  db.get(
    "SELECT * FROM users WHERE verify_token = ? AND token_expires > ?", 
    [token, Date.now()], 
    (err, user) => {
      if (err) {
        console.error('Database error during token verification:', err);
        return res.status(500).send('Database error occurred.');
      }
      
      if (!user) {
        return res.status(400).send('Invalid or expired reset token.');
      }
      
      fs.readFile(path.join(__dirname, 'views', 'reset-password.html'), 'utf8', (err, html) => {
        if (err) {
          console.error('Error loading reset form:', err);
          return res.status(500).send('Error loading reset form.');
        }
        const filled = html.replace('{{TOKEN}}', token);
        res.send(filled);
      });
    }
  );
});

app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).send('Token and new password are required.');
  }
  
  if (password.length < 6) {
    return res.status(400).send('Password must be at least 6 characters long.');
  }
  
  const hashed = bcrypt.hashSync(password, 10);
  
  db.run(
    "UPDATE users SET password = ?, verify_token = NULL, token_expires = NULL WHERE verify_token = ? AND token_expires > ?", 
    [hashed, token, Date.now()], 
    function (err) {
      if (err) {
        console.error('Database error during password reset:', err);
        return res.status(500).send('Database error occurred.');
      }
      
      if (this.changes === 0) {
        return res.status(400).send('Invalid or expired reset token.');
      }
      
      res.send('Password reset successful! You may now <a href="/">log in</a> with your new password.');
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something went wrong!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// START SERVER ON PORT 5500
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Admin credentials:');
  console.log('Email: martinez.135@newfaithministriesorg.faith');
  console.log('Email: andrew.32@newfaithministriesorg.faith');
  console.log('Password: admin123');
});