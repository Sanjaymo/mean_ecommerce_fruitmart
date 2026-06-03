const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerProfileSchema = new mongoose.Schema(
  {
    shopName: { type: String, trim: true, default: '' },
    shopLocation: { type: String, trim: true, default: '' },
    shopPhoto: { type: String, default: '' },
    userPhoto: { type: String, default: '' },
    contributionPercent: { type: Number, min: 1, max: 50, default: 10 },
    sellerStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedAt: { type: Date },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    profilePhoto: { type: String, default: '' },
    password: { type: String, default: '' },
    googleAuth: {
      googleId: { type: String, default: '' },
      picture: { type: String, default: '' },
      enabled: { type: Boolean, default: false },
    },
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
    sellerProfile: { type: sellerProfileSchema, default: undefined },
    passwordReset: {
      otpHash: { type: String, default: '' },
      otpExpiresAt: { type: Date },
      resetTokenHash: { type: String, default: '' },
      resetTokenExpiresAt: { type: Date },
    },
    deliveryLocation: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
      addressLine: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      formattedAddress: { type: String, trim: true, default: '' },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (!this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.hasPassword = Boolean(this.password);
  obj.isGoogleUser = Boolean(this.googleAuth && this.googleAuth.enabled);
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
