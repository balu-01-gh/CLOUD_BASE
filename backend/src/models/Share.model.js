const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'File', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    shareKey: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model('Share', shareSchema);
