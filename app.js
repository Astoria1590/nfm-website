require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const cors = require('cors');  // <--- added cors

// Optional: Stripe setup if STRIPE_SKEY is defined
let stripe = null;
if (process.env.STRIPE_SKEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SKEY);
  console.log('Stripe initialized');
}

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB Atlas');
});

const app = express();
app.set('port', process.env.PORT || 8080);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - allow your frontend origin and send credentials
app.use(cors({
  origin: 'https://www.newfaithministriesorg.faith',  // frontend URL
  credentials: true,
}));

// Sessions with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'none',  // important for cross-site cookies
      secure: true,      // ensure HTTPS is used in production
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages and security middleware
app.use(flash());
// app.use(lusca.csrf()); // keep disabled unless you handle CSRF tokens properly
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// Static public folder
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
app.use(limiter);

// ===== Passport Setup =====
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User'); // Your User model

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    console.log('Attempting login for:', email);
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Password incorrect');
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      console.log('User authenticated');
      return done(null, user);
    } catch (err) {
      console.error('Error in local strategy:', err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ===== Routes =====
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// GET Login Page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// POST Login Handler
app.post('/login', (req, res, next) => {
  console.log('Login POST request received:', req.body.email);
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Passport error:', err);
      return next(err);
    }
    if (!user) {
      console.log('Login failed:', info.message);
      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('Login successful for:', user.email);
      return res.json({ message: 'Login successful' });
    });
  })(req, res, next);
});

// GET Dashboard (Protected)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// GET Logout
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Dev error handler
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

// Start server
app.listen(app.get('port'), () => {
  console.log(`🚀 Server running at http://localhost:${app.get('port')}`);
});
