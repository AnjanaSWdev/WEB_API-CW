const SolarInstallation = require('../models/SolarInstallation');
const { ApiError, asyncHandler } = require('./errorHandler');

// Protects installation-specific write routes. The device must send its
// apiKey in the `x-api-key` header, and that key must belong to the SAME
// installation named in the URL (:id) — a device cannot write readings
// for any installation other than its own.
const requireDeviceAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing x-api-key header');
  }

  // apiKey has `select: false` in the schema, so it must be explicitly
  // requested here — by default Mongoose queries omit it entirely.
  const installation = await SolarInstallation.findById(req.params.id).select('+apiKey');
  if (!installation) {
    throw new ApiError(404, 'NOT_FOUND', 'Installation not found');
  }

  if (installation.apiKey !== apiKey) {
    throw new ApiError(403, 'FORBIDDEN', 'API key does not match this installation');
  }

  req.installation = installation;
  next();
});

module.exports = requireDeviceAuth;