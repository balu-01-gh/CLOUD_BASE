const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    originalName: { type: String, required: true },
    secureUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true, unique: true, index: true },
    resourceType: { type: String, required: true },
    contentType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },

    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model('File', fileSchema);

