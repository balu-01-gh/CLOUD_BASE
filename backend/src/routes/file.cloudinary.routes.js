const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth.middleware');
const FileModel = require('../models/File.model');
const ShareModel = require('../models/Share.model');
const { configureCloudinary } = require('../utils/cloudinary');
const { getUserQuotaBytes } = require('../utils/quota');



const router = express.Router();

// Keep uploads in memory so we can stream to Cloudinary without saving to disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 104857600 } });


// List files for current user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const files = await FileModel.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .select('_id originalName secureUrl contentType sizeBytes uploadedAt cloudinaryPublicId');

    return res.json({ files: files.map((f) => ({
      _id: f._id,
      originalName: f.originalName,
      secureUrl: f.secureUrl,
      contentType: f.contentType,
      sizeBytes: f.sizeBytes,
      uploadedAt: f.uploadedAt,
      cloudinaryPublicId: f.cloudinaryPublicId
    })) });
  } catch (err) {
    next(err);
  }
});

// Download file (proxies the secure Cloudinary resource to trigger standard browser attachment download)
router.get('/download/:fileId', requireAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.findOne({ _id: fileId, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

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

// Delete file (metadata + Cloudinary asset)
router.delete('/:fileId', requireAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;

    const file = await FileModel.findOne({ _id: fileId, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const cloudinary = configureCloudinary();

    // Fix deletion resource_type bug by using the saved resourceType
    // Wrap in try-catch so if the asset is already missing on Cloudinary,
    // we still successfully delete the record from MongoDB.
    try {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId, { resource_type: file.resourceType || 'raw' });
    } catch (clErr) {
      console.error('Cloudinary destroy warning:', clErr.message || clErr);
    }

    // Clean up public share links if any exist
    await ShareModel.deleteMany({ fileId: file._id });

    await FileModel.deleteOne({ _id: file._id });

    return res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// Upload file to Cloudinary (multipart form-data field name: "file")
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    // multer parses multipart; it should be attached as req.file
    if (!req.file) return res.status(400).json({ message: 'file is required' });

    // App-enforced per-user quota (default 5GB)
    const quotaBytes = getUserQuotaBytes();
    if (quotaBytes && quotaBytes > 0) {
      const incomingBytes = req.file.size || 0;
      const usedBytes = await FileModel.aggregate([
        { $match: { userId: req.user.id } },
        { $group: { _id: null, total: { $sum: '$sizeBytes' } } }
      ]);
      const currentUsed = usedBytes?.[0]?.total || 0;

      if (currentUsed + incomingBytes > quotaBytes) {
        const remaining = Math.max(0, quotaBytes - currentUsed);
        return res.status(413).json({
          message: 'Storage quota exceeded',
          quotaBytes,
          usedBytes: currentUsed,
          remainingBytes: remaining
        });
      }
    }

    const cloudinary = configureCloudinary();

    // Upload from memory buffer
    // Use a more specific Cloudinary resource_type when possible so browsers can render.
    // Images -> 'image'
    // Video/Audio -> 'video'
    // PDFs/Documents -> 'upload'
    const mime = req.file?.mimetype || '';
    const isPdf = mime === 'application/pdf';
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');
    const isAudio = mime.startsWith('audio/');

    // Cloudinary: 'video' covers audio/video. 'image' covers images and PDFs.
    const resourceType = isImage || isPdf ? 'image' : (isVideo || isAudio ? 'video' : 'raw');

    const uploadRes = await cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: `user_${req.user.id}`,
        public_id: `uploads_${Date.now()}_${req.file.originalname}`,
        use_filename: true,
        unique_filename: false
      },
      async (err, result) => {
        if (err) return next(err);

        const secureUrl = result?.secure_url || result?.url;
        const publicId = result?.public_id;

        if (!secureUrl || !publicId) return res.status(500).json({ message: 'Cloudinary upload failed' });

        const fileDoc = await FileModel.create({
          userId: req.user.id,
          originalName: req.file.originalname,
          secureUrl,
        cloudinaryPublicId: publicId,
          resourceType: result?.resource_type || 'raw',
          contentType: req.file.mimetype || 'application/octet-stream',
          sizeBytes: req.file.size,
          uploadedAt: new Date()
        });

        return res.status(201).json({
          file: {
            _id: fileDoc._id,
            originalName: fileDoc.originalName,
            secureUrl: fileDoc.secureUrl,
            cloudinaryPublicId: fileDoc.cloudinaryPublicId,
            contentType: fileDoc.contentType,
            sizeBytes: fileDoc.sizeBytes,
            uploadedAt: fileDoc.uploadedAt
          }
        });
      }
    );

    // Convert buffer to stream
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(req.file.buffer);
    readable.push(null);
    readable.pipe(uploadRes);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


