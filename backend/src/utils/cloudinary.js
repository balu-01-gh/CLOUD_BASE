const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name) throw new Error('CLOUDINARY_CLOUD_NAME missing');
  if (!api_key) throw new Error('CLOUDINARY_API_KEY missing');
  if (!api_secret) throw new Error('CLOUDINARY_API_SECRET missing');

  cloudinary.config({ cloud_name, api_key, api_secret });
  return cloudinary;
}

// Helps troubleshooting Cloudinary auth failures without leaking secrets.
function cloudinaryEnvStatus() {
  return {
    CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET)
  };
}

module.exports = { configureCloudinary, cloudinaryEnvStatus };


