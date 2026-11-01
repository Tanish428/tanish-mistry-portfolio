import jwt from 'jsonwebtoken';
import config from '../../config/env.js';
import Admin from './admin.model.js';

/**
 * Parses duration string (e.g. '15m', '1h', '7d') to milliseconds
 */
const parseDurationToMs = (duration) => {
  if (typeof duration === 'number') return duration * 1000;
  if (!duration || typeof duration !== 'string') return 15 * 60 * 1000;

  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
};

/**
 * Generates signed JWT with explicit claims
 */
export const generateToken = (adminId) => {
  return jwt.sign(
    {
      sub: adminId.toString(),
    },
    config.jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: config.jwtExpiresIn,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    }
  );
};

/**
 * Verifies JWT signature and claims
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret, {
    algorithms: ['HS256'],
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  });
};

/**
 * Cookie options for setting authentication cookie
 */
export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: config.authCookieSecure,
  sameSite: config.authCookieSameSite,
  path: '/',
  maxAge: parseDurationToMs(config.jwtExpiresIn),
});

/**
 * Cookie options for clearing authentication cookie
 */
export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: config.authCookieSecure,
  sameSite: config.authCookieSameSite,
  path: '/',
});

/**
 * Authenticates administrator credentials and returns token + admin data
 */
export const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !admin.isActive) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(admin._id);

  return {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  };
};

/**
 * Retrieves active administrator by ID
 */
export const getAdminById = async (adminId) => {
  const admin = await Admin.findById(adminId);

  if (!admin || !admin.isActive) {
    const error = new Error('Administrator not found or inactive');
    error.statusCode = 401;
    throw error;
  }

  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
  };
};
