const GridSubstation = require('../models/GridSubstation');
const SolarInstallation = require('../models/SolarInstallation');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// GET /substations/:id
const getSubstation = asyncHandler(async (req, res) => {
  const substation = await GridSubstation.findById(req.params.id);
  if (!substation) {
    throw new ApiError(404, 'NOT_FOUND', 'Substation not found');
  }
  res.json(substation);
});

// GET /substations/:id/installations
// Scoped collection, same pattern as districts/:id/substations — every
// installation whose substationId matches this substation.
const listInstallationsForSubstation = asyncHandler(async (req, res) => {
  const substation = await GridSubstation.findById(req.params.id);
  if (!substation) {
    throw new ApiError(404, 'NOT_FOUND', 'Substation not found');
  }

  const installations = await SolarInstallation.find({ substationId: substation._id }).sort({ ownerName: 1 });
  res.json(installations);
});



module.exports = { getSubstation, listInstallationsForSubstation };