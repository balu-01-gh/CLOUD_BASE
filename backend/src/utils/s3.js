// S3 removed (paid). Kept this module only so legacy imports fail fast.

function getS3() {
  throw new Error('S3 is removed. Use Cloudinary endpoints instead.');
}

function getBucket() {
  throw new Error('S3 is removed. Use Cloudinary endpoints instead.');
}

module.exports = { getS3, getBucket };

