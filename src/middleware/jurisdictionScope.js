const District = require('../models/District');
const GridSubstation = require('../models/GridSubstation');
const SolarInstallation = require('../models/SolarInstallation');
const { ApiError, asyncHandler } = require('./errorHandler');

// Core rule, shared by every jurisdiction check below:
//   - national: unrestricted
//   - provincial: allowed only if the district's province matches theirs
//   - district: allowed only if the district itself matches theirs
function assertDistrictAccess(user, district) {
  const { role, jurisdictionId } = user;

  if (role === 'national') return;

  if (role === 'provincial') {
    if (String(district.provinceId) !== String(jurisdictionId)) {
      throw new ApiError(403, 'FORBIDDEN', 'This district is outside your province');
    }
    return;
  }

  if (role === 'district') {
    if (String(district._id) !== String(jurisdictionId)) {
      throw new ApiError(403, 'FORBIDDEN', 'You may only access your own district');
    }
    return;
  }

  throw new ApiError(403, 'FORBIDDEN', 'Unrecognized role');
}

// GET /districts/:id, /districts/:id/substations — :id IS a district.
const requireDistrictAccess = asyncHandler(async (req, res, next) => {
  const district = await District.findById(req.params.id);
  if (!district) {
    throw new ApiError(404, 'NOT_FOUND', 'District not found');
  }
  assertDistrictAccess(req.user, district);
  next();
});

// GET /substations/:id, /substations/:id/installations — :id IS a
// substation. We resolve ITS district, then apply the same rule.
const requireSubstationAccess = asyncHandler(async (req, res, next) => {
  const substation = await GridSubstation.findById(req.params.id);
  if (!substation) {
    throw new ApiError(404, 'NOT_FOUND', 'Substation not found');
  }

  const district = await District.findById(substation.districtId);
  if (!district) {
    throw new ApiError(404, 'NOT_FOUND', 'District not found');
  }

  assertDistrictAccess(req.user, district);
  req.substation = substation; // save a re-fetch in the controller
  next();
});

// GET /installations/:id and everything nested under it — :id IS an
// installation. We walk installation -> substation -> district.
const requireInstallationAccess = asyncHandler(async (req, res, next) => {
  const installation = await SolarInstallation.findById(req.params.id);
  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  const substation = await GridSubstation.findById(installation.substationId);
  if (!substation) {
    throw new ApiError(404, 'NOT_FOUND', 'Substation not found');
  }

  const district = await District.findById(substation.districtId);
  if (!district) {
    throw new ApiError(404, 'NOT_FOUND', 'District not found');
  }

  assertDistrictAccess(req.user, district);
  req.installation = installation; // save a re-fetch in the controller
  next();
});

module.exports = { requireDistrictAccess, requireSubstationAccess, requireInstallationAccess };