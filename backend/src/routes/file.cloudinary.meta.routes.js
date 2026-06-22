const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const FileModel = require('../models/File.model');
const { configureCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Rename/edit metadata (ownership enforced).
// We implement rename by updating MongoDB originalName + Cloudinary public_id.
// Note: Cloudinary uses immutable IDs, so we call uploader.rename.
router.patch('/:fileId/rename', requireAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { originalName } = req.body || {};

    if (!originalName || typeof originalName !== 'string') {
      return res.status(400).json({ message: 'originalName is required' });
    }

    const file = await FileModel.findOne({ _id: fileId, userId: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const cloudinary = configureCloudinary();

    // Build new public_id preserving folder user_<id>
    const newPublicId = (() => {
      const folder = `user_${req.user.id}`;
      // Strip any directory traversal or path characters from originalName
      const cleanName = originalName.replace(/[\/\\?#%&]/g, '_');
      return `${folder}/uploads_${Date.now()}_${cleanName}`;
    })();

    // Rename in Cloudinary, ensuring we pass the correct resource_type option
    const renameRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.rename(
        file.cloudinaryPublicId,
        newPublicId,
        { resource_type: file.resourceType || 'raw' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
    });

    const updated = await FileModel.findOneAndUpdate(
      { _id: file._id },
      {
        $set: {
          originalName,
          cloudinaryPublicId: newPublicId,
          secureUrl: renameRes.secure_url || renameRes.url || file.secureUrl
        }
      },
      { new: true }
    );

    return res.json({
      file: {
        _id: updated._id,
        originalName: updated.originalName,
        secureUrl: updated.secureUrl,
        cloudinaryPublicId: updated.cloudinaryPublicId
      }
    });
  } catch (err) {
    next(err);
  }
});

// Lightweight stats endpoint.
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const files = await FileModel.find({ userId: req.user.id });
    const totalFiles = files.length;
    const totalBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

    const quotaBytesRaw = process.env.USER_STORAGE_QUOTA_BYTES;
    const defaultQuotaBytes = 5 * 1024 * 1024 * 1024; // 5 GB
    const quotaBytes = quotaBytesRaw ? Number(quotaBytesRaw) : defaultQuotaBytes;

    let storageLimitBytes = null;
    let storagePercent = null;
    if (quotaBytes && !Number.isNaN(quotaBytes) && quotaBytes > 0) {
      storageLimitBytes = quotaBytes;
      storagePercent = Math.min(100, Math.round((totalBytes / storageLimitBytes) * 100));
    }

    return res.json({
      totalFiles,
      totalBytes,
      storageLimitBytes,
      storagePercent,
      recentUploads: files
        .slice()
        .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
        .slice(0, 5)
        .map((f) => ({ _id: f._id, originalName: f.originalName, sizeBytes: f.sizeBytes, secureUrl: f.secureUrl }))
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;

