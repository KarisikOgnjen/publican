/**
 * CRM Personal Profile API
 *
 * API Contract:
 *
 * GET /api/profile
 *   Response 200: { id, firstName, lastName, email, phoneNumber, jobTitle, bio, avatarUrl, role }
 *   Response 500: { error: string }
 *
 * PUT /api/profile
 *   Request body: { firstName, lastName, email, phoneNumber?, jobTitle?, bio? }
 *   Response 200: { id, firstName, lastName, email, phoneNumber, jobTitle, bio, avatarUrl, role }
 *   Response 400: { error: string, details?: { field: string, message: string }[] }
 *   Response 500: { error: string }
 *
 * POST /api/profile/avatar
 *   Request: multipart/form-data with field "avatar" (image file)
 *   Response 200: { avatarUrl: string }
 *   Response 400: { error: string }
 *   Response 500: { error: string }
 */

'use strict';

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Paths
const DATA_FILE = path.join(__dirname, 'data', 'profile.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
    }
  },
});

// Data helpers
function readProfile() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeProfile(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Validation helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Accepts formats like +1-555-0100, (555) 123-4567, 555.123.4567, +44 20 7946 0958
  return /^[+]?[\d\s\-().]{7,20}$/.test(phone);
}

function validateProfileBody(body) {
  const errors = [];

  if (!body.firstName || typeof body.firstName !== 'string' || !body.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!body.lastName || typeof body.lastName !== 'string' || !body.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(body.email)) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }

  if (body.phoneNumber && typeof body.phoneNumber === 'string' && body.phoneNumber.trim()) {
    if (!isValidPhone(body.phoneNumber.trim())) {
      errors.push({ field: 'phoneNumber', message: 'Phone number format is invalid' });
    }
  }

  return errors;
}

// --- Routes ---

/**
 * GET /api/profile
 * Returns the current user's profile information.
 */
app.get('/api/profile', (req, res) => {
  try {
    const profile = readProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read profile data' });
  }
});

/**
 * PUT /api/profile
 * Updates the current user's profile information.
 */
app.put('/api/profile', (req, res) => {
  try {
    const validationErrors = validateProfileBody(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    const current = readProfile();
    const updated = {
      ...current,
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.trim(),
      phoneNumber: req.body.phoneNumber ? req.body.phoneNumber.trim() : null,
      jobTitle: req.body.jobTitle ? req.body.jobTitle.trim() : null,
      bio: req.body.bio ? req.body.bio.trim() : null,
    };

    writeProfile(updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile data' });
  }
});

/**
 * POST /api/profile/avatar
 * Uploads a new avatar image for the current user.
 */
app.post('/api/profile/avatar', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds the 5MB limit' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    try {
      const avatarUrl = `/uploads/${req.file.filename}`;
      const current = readProfile();
      const updated = { ...current, avatarUrl };
      writeProfile(updated);
      res.json({ avatarUrl });
    } catch (writeErr) {
      res.status(500).json({ error: 'Failed to save avatar' });
    }
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CRM Profile API running on port ${PORT}`);
  });
}

module.exports = app;
