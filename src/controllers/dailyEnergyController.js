const SolarInstallation = require('../models/SolarInstallation');
const { computeDailyEnergy, listDailyEnergy: listDailyEnergyService } = require('../services/dailyEnergyService');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

function toMidnight(dateInput) {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// GET /installations/:id/daily-energy?page=&limit=
const listDailyEnergy = asyncHandler(async (req, res) => {
  const installation = await SolarInstallation.findById(req.params.id);
  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const { data, totalCount } = await listDailyEnergyService(installation._id, { skip, limit });
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const baseUrl = `${req.baseUrl}${req.path}`;

  res.json({
    totalCount,
    page,
    limit,
    totalPages,
    links: {
      next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null
    },
    data
  });
});

// GET /installations/:id/daily-energy/:date  (date = YYYY-MM-DD)
const getDailyEnergyForDate = asyncHandler(async (req, res) => {
  const installation = await SolarInstallation.findById(req.params.id);
  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  const day = toMidnight(req.params.date);
  if (Number.isNaN(day.getTime())) {
    throw new ApiError(400, 'INVALID_DATE', 'date must be in YYYY-MM-DD format');
  }

  const summary = await computeDailyEnergy(installation._id, day);
  if (!summary) {
    throw new ApiError(404, 'NOT_FOUND', 'No readings found for that date');
  }

  res.json(summary);
});

module.exports = { listDailyEnergy, getDailyEnergyForDate };