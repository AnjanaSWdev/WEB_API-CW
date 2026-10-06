const mongoose = require('mongoose');

const gridSubstationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GridSubstation', gridSubstationSchema);