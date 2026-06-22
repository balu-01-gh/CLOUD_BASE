const express = require('express');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth.middleware');
const File = require('../models/File.model');
const Share = require('../models/Share.model');

const router = express.Router();

// Generate a public sharing link (JWT protected)
router.post('/create', requireAuth, async (req, res, next) => {
  try {
    const { fileId, expiresAt } = req.body || {};
    if (!fileId) return res.status(400).json({ message: 'fileId is required' });

    // Enforce ownership
    const file = await File.findOne({ _id: fileId, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if a share link already exists for this file
    let share = await Share.findOne({ fileId: file._id, userId: req.user.id });
    if (share) {
      if (expiresAt) {
        share.expiresAt = new Date(expiresAt);
        await share.save();
      }
      return res.json({ share });
    }

    // Generate random key
    const shareKey = crypto.randomBytes(16).toString('hex');

    share = await Share.create({
      fileId: file._id,
      userId: req.user.id,
      shareKey,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    return res.status(201).json({ share });
  } catch (err) {
    next(err);
  }
});

// Retrieve details for a specific file's active share (JWT protected)
router.get('/file/:fileId', requireAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const share = await Share.findOne({ fileId, userId: req.user.id });
    if (!share) return res.status(404).json({ message: 'Share link not found' });
    return res.json({ share });
  } catch (err) {
    next(err);
  }
});

// Public endpoint to retrieve file details using a share key (No login required)
router.get('/:shareKey', async (req, res, next) => {
  try {
    const { shareKey } = req.params;

    const share = await Share.findOne({ shareKey });
    if (!share) return res.status(404).json({ message: 'Shared file not found or link has expired' });

    // Check expiration
    if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
      await Share.deleteOne({ _id: share._id });
      return res.status(410).json({ message: 'This sharing link has expired' });
    }

    const file = await File.findById(share.fileId);
    if (!file) return res.status(404).json({ message: 'The shared file no longer exists' });

    // Increment views counter
    share.views = (share.views || 0) + 1;
    await share.save();

    return res.json({
      originalName: file.originalName,
      secureUrl: file.secureUrl,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      uploadedAt: file.uploadedAt,
      views: share.views
    });
  } catch (err) {
    next(err);
  }
});

// Public endpoint to download a shared file using a share key (No login required)
router.get('/:shareKey/download', async (req, res, next) => {
  try {
    const { shareKey } = req.params;

    const share = await Share.findOne({ shareKey });
    if (!share) return res.status(404).json({ message: 'Shared file not found or link has expired' });

    // Check expiration
    if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
      await Share.deleteOne({ _id: share._id });
      return res.status(410).json({ message: 'This sharing link has expired' });
    }

    const file = await File.findById(share.fileId);
    if (!file) return res.status(404).json({ message: 'The shared file no longer exists' });

    // Increment views counter
    share.views = (share.views || 0) + 1;
    await share.save();

    // Fetch from Cloudinary on backend to avoid CORS and stream as attachment
    const response = await fetch(file.secureUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from cloud storage: ${response.statusText}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
