const District = require('../models/District');
const GridSubstation = require('../models/GridSubstation');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// GET /districts
const listDistricts = asyncHandler(async (req, res) => {
  const districts = await District.find().sort({ name: 1 });
  res.json(districts);
});

// GET /districts/:id
const getDistrict = asyncHandler(async (req, res) => {
  const district = await District.findById(req.params.id);
  if (!district) {
    throw new ApiError(404, 'NOT_FOUND', 'District not found');
  }
  res.json(district);
});

// GET /districts/:id/substations
// Scoped collection: every substation whose districtId matches this
// district. There is no flat /substations route — by design, since a
// substation only makes sense in the context of its district.
const listSubstationsForDistrict = asyncHandler(async (req, res) => {
  const district = await District.findById(req.params.id);
  if (!district) {
    throw new ApiError(404, 'NOT_FOUND', 'District not found');
  }

  const substations = await GridSubstation.find({ districtId: district._id }).sort({ name: 1 });
  res.json(substations);
});

module.exports = { listDistricts, getDistrict, listSubstationsForDistrict };