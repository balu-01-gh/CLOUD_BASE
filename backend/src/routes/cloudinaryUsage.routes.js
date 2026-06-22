const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { configureCloudinary, cloudinaryEnvStatus } = require('../utils/cloudinary');

const router = express.Router();

// Provider usage endpoint (Cloudinary-reported).
// For Free plans, limit/remaining may not be exposed by the API.
router.get('/usage', requireAuth, async (req, res, next) => {
  try {
    const envStatus = cloudinaryEnvStatus();
    const cloudinary = configureCloudinary();

    // Best-effort: different Cloudinary plans/accounts may expose different fields.
    // We'll try the most relevant usage endpoint. If it fails, we return a graceful message.
    let usage;
    try {
      usage = await cloudinary.api.usage();
    } catch (_err) {
      usage = null;
    }


    // Normalize response into a stable UI contract.
    // Attempt to detect storage-related fields.
    // NOTE: field names may differ; we keep unknown values as null.
    const storageUsedBytes = (() => {
      if (!usage) return null;
      // Common patterns: usage.resources. or usage.usage. or direct fields.
      const candidates = [
        usage?.resources?.storage_bytes,
        usage?.resources?.storageBytes,
        usage?.usage?.storage_bytes,
        usage?.usage?.storageBytes,
        usage?.storage_bytes,
        usage?.storageBytes
      ];
      for (const c of candidates) {
        const n = Number(c);
        if (!Number.isNaN(n) && n >= 0) return n;
      }
      return null;
    })();

    const storageLimitBytes = (() => {
      if (!usage) return null;
      const candidates = [
        usage?.resources?.storage_limit_bytes,
        usage?.resources?.storageLimitBytes,
        usage?.usage?.storage_limit_bytes,
        usage?.usage?.storageLimitBytes,
        usage?.storage_limit_bytes,
        usage?.storageLimitBytes
      ];
      for (const c of candidates) {
        const n = Number(c);
        if (!Number.isNaN(n) && n > 0) return n;
      }
      return null;
    })();

    const storageRemainingBytes = (() => {
      if (storageUsedBytes == null || storageLimitBytes == null) return null;
      return Math.max(0, storageLimitBytes - storageUsedBytes);
    })();

    if (!usage && (envStatus.CLOUDINARY_API_KEY === false || envStatus.CLOUDINARY_API_SECRET === false || envStatus.CLOUDINARY_CLOUD_NAME === false)) {
      return res.status(500).json({
        message: 'Cloudinary API not configured',
        cloudinaryEnv: envStatus
      });
    }

    return res.json({
      storageUsedBytes,
      storageLimitBytes,
      storageRemainingBytes,
      raw: usage ? { /* intentionally omit huge payload */ } : null,
      cloudinaryEnv: envStatus
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;

