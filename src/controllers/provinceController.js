const Province = require('../models/Province');
const District = require('../models/District');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// GET /provinces
const listProvinces = asyncHandler(async (req, res) => {
  const provinces = await Province.find().sort({ name: 1 });
  res.json(provinces);
});

// GET /provinces/:id
const getProvince = asyncHandler(async (req, res) => {
  const province = await Province.findById(req.params.id);
  if (!province) {
    throw new ApiError(404, 'NOT_FOUND', 'Province not found');
  }
  res.json(province);
});

// GET /provinces/:id/districts
const listDistrictsForProvince = asyncHandler(async (req, res) => {
  const province = await Province.findById(req.params.id);
  if (!province) {
    throw new ApiError(404, 'NOT_FOUND', 'Province not found');
  }

  const districts = await District.find({ provinceId: province._id }).sort({ name: 1 });
  res.json(districts);
});

module.exports = { listProvinces, getProvince, listDistrictsForProvince };