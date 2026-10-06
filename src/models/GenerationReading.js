const mongoose = require('mongoose');

// GenerationReading is deliberately its own append-only time-series
// collection (see coursework brief section 3), NOT a set of last-value
// fields bolted onto SolarInstallation. This is what makes the analytical
// (historical) read path possible at all: pagination, filtering and
// sorting over history only make sense if every reading is retained.
const generationReadingSchema = new mongoose.Schema(
  {
    installationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SolarInstallation',
      required: true,
      index: true
    },
    timestamp: { type: Date, required: true, index: true },
    powerKw: { type: Number, required: true, min: 0 },   // instantaneous
    // Cumulative energy generated SINCE MIDNIGHT (resets to ~0 at the start
    // of each local day, mirroring how many inverters report a daily
    // running total). The last reading before midnight is therefore that
    // day's total — see the dailyEnergyService (built later), which
    // computes exactly that on demand rather than storing it separately.
    energyKwh: { type: Number, required: true, min: 0 },
    voltage: { type: Number, required: true, min: 0 }
  },
  { timestamps: false } // the reading's own `timestamp` is authoritative, not createdAt
);

// Compound index: the readings-history query is always "one installation,
// ordered/filtered by time" — this index is what makes that query and
// pagination cheap even at 100K+ documents.
generationReadingSchema.index({ installationId: 1, timestamp: -1 });

module.exports = mongoose.model('GenerationReading', generationReadingSchema);