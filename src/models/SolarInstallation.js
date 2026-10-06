const mongoose = require('mongoose');

const solarInstallationSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    capacityKw: { type: Number, required: true, min: 0 },

    // The meter/inverter identifier is a field on the installation itself.
    // Deliberately NOT a separate Device collection/entity (see coursework
    // brief section 3): an installation IS the metered asset, the meter is
    // just an attribute that identifies which physical unit reports for it.
    meterId: { type: String, required: true, unique: true, trim: true },

    substationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GridSubstation',
      required: true,
      index: true
    },
    installedDate: { type: Date, required: true },

    // API key used by the device to authenticate its own writes.
    // Never returned in list responses (see toJSON transform below).
    apiKey: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

solarInstallationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.apiKey;
    return ret;
  }
});

module.exports = mongoose.model('SolarInstallation', solarInstallationSchema);