const SolarInstallation = require('../models/SolarInstallation');
const GenerationReading = require('../models/GenerationReading');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// GET /installations/:id/readings?page=&limit=&from=&to=&sort=&order=
// The analytical/historical view: paginated, filterable, sortable.
const listReadings = asyncHandler(async (req, res) => {
  const installation = await SolarInstallation.findById(req.params.id);
  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 500);
  const skip = (page - 1) * limit;

  // Build the filter: always scoped to this installation, optionally
  // narrowed by a time window.
  const filter = { installationId: installation._id };
  if (req.query.from || req.query.to) {
    filter.timestamp = {};
    if (req.query.from) {
      const from = new Date(req.query.from);
      if (Number.isNaN(from.getTime())) {
        throw new ApiError(400, 'INVALID_DATE', '`from` must be a valid date');
      }
      filter.timestamp.$gte = from;
    }
    if (req.query.to) {
      const to = new Date(req.query.to);
      if (Number.isNaN(to.getTime())) {
        throw new ApiError(400, 'INVALID_DATE', '`to` must be a valid date');
      }
      filter.timestamp.$lte = to;
    }
  }

  // Sorting: only `timestamp` is supported (the only field that makes
  // sense to sort a time series by), ascending or descending.
  const sortField = 'timestamp';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  const [totalCount, readings] = await Promise.all([
    GenerationReading.countDocuments(filter),
    GenerationReading.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const baseUrl = `${req.baseUrl}${req.path}`;
  const queryWithout = (key) => {
    const q = new URLSearchParams(req.query);
    q.delete(key);
    return q.toString();
  };

  res.json({
    totalCount,
    page,
    limit,
    totalPages,
    links: {
      next: page < totalPages
        ? `${baseUrl}?${queryWithout('page')}&page=${page + 1}`
        : null,
      prev: page > 1
        ? `${baseUrl}?${queryWithout('page')}&page=${page - 1}`
        : null
    },
    data: readings
  });
});







// POST /installations/:id/readings
// Device ingestion endpoint — protected by requireDeviceAuth, so by the
// time this runs we already know req.installation is the authenticated
// device's OWN installation (not an arbitrary one from the URL).
const createReading = asyncHandler(async (req, res) => {
  const { timestamp, powerKw, energyKwh, voltage } = req.body;

  if (
    timestamp === undefined ||
    powerKw === undefined ||
    energyKwh === undefined ||
    voltage === undefined
  ) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'timestamp, powerKw, energyKwh and voltage are all required'
    );
  }

  const parsedTimestamp = new Date(timestamp);
  if (Number.isNaN(parsedTimestamp.getTime())) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'timestamp must be a valid date');
  }

  const reading = await GenerationReading.create({
    installationId: req.installation._id,
    timestamp: parsedTimestamp,
    powerKw,
    energyKwh,
    voltage
  });

  // 201 Created + Location header pointing at the new resource — standard
  // REST convention for a successful POST that creates something.
  res.status(201)
    .location(`/installations/${req.installation._id}/readings/${reading._id}`)
    .json(reading);
});



module.exports = { listReadings, createReading }; 