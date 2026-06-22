function getUserQuotaBytes() {
  const quotaBytesRaw = process.env.USER_STORAGE_QUOTA_BYTES;
  const defaultQuotaBytes = 5 * 1024 * 1024 * 1024; // 5 GB
  if (!quotaBytesRaw) return defaultQuotaBytes;

  const n = Number(quotaBytesRaw);
  if (Number.isNaN(n) || n <= 0) return defaultQuotaBytes;
  return n;
}

function computePercent(usedBytes, limitBytes) {
  if (!limitBytes || limitBytes <= 0) return null;
  if (usedBytes == null) return null;
  return Math.min(100, Math.round((usedBytes / limitBytes) * 100));
}

module.exports = { getUserQuotaBytes, computePercent };

