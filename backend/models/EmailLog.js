const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    error: { type: String, default: '' },
  },
  { _id: false }
);

const emailLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['direct', 'campaign'], required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    recipients: { type: [recipientSchema], default: [] },
    totalRecipients: { type: Number, required: true, min: 0 },
    sentCount: { type: Number, required: true, min: 0 },
    failedCount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailLog', emailLogSchema);
