const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('District', districtSchema);