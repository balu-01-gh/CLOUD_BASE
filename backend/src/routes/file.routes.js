const express = require('express');

const router = express.Router();

// S3 removed (paid). S3 endpoints disabled; Cloudinary endpoints mounted at /api/cloudinary-files.
// Cloudinary endpoints are mounted at /api/cloudinary-files.

router.get('/', (_req, res) => res.status(410).json({ message: 'S3 endpoints disabled. Use /api/cloudinary-files instead.' }));

module.exports = router;




