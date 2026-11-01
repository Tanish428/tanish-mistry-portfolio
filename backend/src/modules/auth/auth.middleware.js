import config from '../../config/env.js';
import { verifyToken, getAdminById } from './auth.service.js';

/**
 * Authentication middleware: verifies JWT from HttpOnly cookie and loads active admin
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[config.authCookieName];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        data: null,
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
        data: null,
      });
    }

    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token claims',
        data: null,
      });
    }

    const admin = await getAdminById(decoded.sub);
    req.admin = admin;

    next();
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
    next(error);
  }
};
