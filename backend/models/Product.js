const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    description: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sellerContribution: { type: Number, min: 0, max: 100, default: 0 },
    sellerName: { type: String, default: 'FruitMart' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
