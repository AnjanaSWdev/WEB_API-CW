const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

// Verifies the Authorization: Bearer <token> header and attaches the
// decoded payload (userId, role, jurisdictionId) to req.user. Any route
// using this middleware can assume req.user exists and is trustworthy —
// the signature check is what makes it trustworthy, not just parsing it.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role, jurisdictionId, iat, exp }
    next();
  } catch (err) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

module.exports = requireAuth;