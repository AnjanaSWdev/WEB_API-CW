const SolarInstallation = require('../models/SolarInstallation');
const GenerationReading = require('../models/GenerationReading');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// GET /installations
const listInstallations = asyncHandler(async (req, res) => {
  const installations = await SolarInstallation.find().sort({ ownerName: 1 });
  res.json(installations);
});

// GET /installations/:id
// Composite resource: the installation itself, PLUS its substation/district/
// province context (via nested populate) AND its most recent reading —
// everything a client would need about one installation in a single call,
// rather than forcing several round trips.
const getInstallation = asyncHandler(async (req, res) => {
  const installation = await SolarInstallation.findById(req.params.id).populate({
    path: 'substationId',
    populate: {
      path: 'districtId',
      populate: { path: 'provinceId' }
    }
  });

  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  const latestReading = await GenerationReading.findOne({ installationId: installation._id })
    .sort({ timestamp: -1 });

  res.json({
    ...installation.toJSON(),
    latestReading: latestReading || null
  });
});


// GET /installations/:id/latest-reading
// Operational view: the single most recent reading for this installation,
// exposed as its own derived resource — not a raw row lookup by ID.
const getLatestReading = asyncHandler(async (req, res) => {
  const installation = await SolarInstallation.findById(req.params.id);
  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  const latestReading = await GenerationReading.findOne({ installationId: installation._id })
    .sort({ timestamp: -1 });

  if (!latestReading) {
    throw new ApiError(404, 'NOT_FOUND', 'No readings found for this installation');
  }

  res.json(latestReading);
});

module.exports = { listInstallations, getInstallation, getLatestReading };