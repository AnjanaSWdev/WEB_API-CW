const GenerationReading = require('../models/GenerationReading');

/**
 * Compute one installation's total for a single calendar day directly from
 * GenerationReading — no stored summary. Since energyKwh resets at
 * midnight, the day's total is simply the LAST reading's energyKwh within
 * that day's window; peak power and reading count come from the same set.
 */
async function computeDailyEnergy(installationId, dayStart) {
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [result] = await GenerationReading.aggregate([
    { $match: { installationId, timestamp: { $gte: dayStart, $lt: dayEnd } } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: null,
        totalEnergyKwh: { $last: '$energyKwh' },
        peakPowerKw: { $max: '$powerKw' },
        readingCount: { $sum: 1 }
      }
    }
  ]);

  if (!result) return null;

  return {
    date: dayStart,
    totalEnergyKwh: result.totalEnergyKwh,
    peakPowerKw: result.peakPowerKw,
    readingCount: result.readingCount
  };
}

/**
 * Paginated list of every calendar day that has readings for an
 * installation, each with its computed total — newest day first.
 */
async function listDailyEnergy(installationId, { skip, limit }) {
  const [facetResult] = await GenerationReading.aggregate([
    { $match: { installationId } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$timestamp', unit: 'day' } },
        totalEnergyKwh: { $last: '$energyKwh' },
        peakPowerKw: { $max: '$powerKw' },
        readingCount: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = facetResult.data.map((d) => ({
    date: d._id,
    totalEnergyKwh: d.totalEnergyKwh,
    peakPowerKw: d.peakPowerKw,
    readingCount: d.readingCount
  }));
  const totalCount = facetResult.totalCount[0]?.count ?? 0;

  return { data, totalCount };
}

module.exports = { computeDailyEnergy, listDailyEnergy };