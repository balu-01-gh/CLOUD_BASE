const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const { signToken } = require('../utils/jwt');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const token = signToken({ sub: user._id.toString(), email: user.email });
    return res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: user._id.toString(), email: user.email });
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

