const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth.middleware');
const { configureCloudinary } = require('../utils/cloudinary');
const FileModel = require('../models/File.model');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 104857600) } });

// Backend upload: frontend -> backend -> Cloudinary
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'file is required' });

    const cloudinary = configureCloudinary();

    const userFolder = `uploads/${req.user.id}`;
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: userFolder,
        resource_type: 'auto',
        filename_override: req.file.originalname
      },
      async (error, uploaded) => {
        if (error) return next(error);

        // uploaded: { public_id, secure_url, etc }
        const fileDoc = await FileModel.create({
          userId: req.user.id,
          originalName: req.file.originalname,
          contentType: req.file.mimetype || 'application/octet-stream',
          sizeBytes: req.file.size,
          cloudinaryPublicId: uploaded.public_id,
          secureUrl: uploaded.secure_url,
          resourceType: uploaded.resource_type || 'image'
        });

        return res.status(201).json({
          file: {
            id: fileDoc._id,
            originalName: fileDoc.originalName,
            contentType: fileDoc.contentType,
            sizeBytes: fileDoc.sizeBytes,
            secureUrl: fileDoc.secureUrl,
            cloudinaryPublicId: fileDoc.cloudinaryPublicId
          }
        });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

