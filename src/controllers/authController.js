const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// POST /auth/register
// Not a typical "public signup" — in a real SLSEA system, user accounts
// would be provisioned by an admin, not self-registered. We expose this
// endpoint anyway for coursework purposes, so you can create test users
// for each role.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, jurisdictionId } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'name, email, password and role are required');
  }

  if (!['national', 'provincial', 'district'].includes(role)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'role must be national, provincial, or district');
  }

  if (role !== 'national' && !jurisdictionId) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'jurisdictionId is required for provincial/district users');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'CONFLICT', 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    jurisdictionId: role === 'national' ? null : jurisdictionId
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    jurisdictionId: user.jurisdictionId
  });
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'email and password are required');
  }

  // passwordHash has select:false, so it must be explicitly requested
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      jurisdictionId: user.jurisdictionId
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

module.exports = { register, login };