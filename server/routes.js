const express = require('express');
const router = express.Router();
const admin = require('./admin');

// Signup listener
router.post('/create-user', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password
    });
    res.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login listener
router.post('/login-user', async (req, res) => {
  const { email, password } = req.body;

  // Firebase Admin SDK does not handle password login directly
  // Usually, frontend should use Firebase Client SDK for login
  res.status(501).json({ error: 'Login should be handled via Firebase Client SDK in React' });
});

// Get listener profile by UID
router.get('/listener/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userRecord = await admin.auth().getUser(uid);
    res.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
