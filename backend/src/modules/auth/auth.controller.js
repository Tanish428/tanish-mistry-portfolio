import config from '../../config/env.js';
import {
  loginAdmin,
  getAuthCookieOptions,
  getClearCookieOptions,
} from './auth.service.js';
import { generateCsrfToken } from '../../middleware/csrf.js';

/**
 * Handle administrator login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, admin } = await loginAdmin(email, password);

    // Set HttpOnly authentication cookie
    res.cookie(config.authCookieName, token, getAuthCookieOptions());

    // Generate CSRF token for subsequent authenticated state-changing requests
    const csrfToken = generateCsrfToken(req, res);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin,
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current authenticated administrator profile
 */
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Administrator authenticated',
    data: {
      admin: req.admin,
    },
  });
};

/**
 * Handle administrator logout
 */
export const logout = (req, res) => {
  res.clearCookie(config.authCookieName, getClearCookieOptions());

  const csrfCookieName = config.isProduction
    ? '__Host-portfolio.x-csrf-token'
    : 'portfolio.x-csrf-token';
  res.clearCookie(csrfCookieName, { path: '/' });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
    data: null,
  });
};

/**
 * Generates and returns a CSRF token
 */
export const getCsrfToken = (req, res) => {
  const csrfToken = generateCsrfToken(req, res);

  res.status(200).json({
    success: true,
    message: 'CSRF token generated',
    data: {
      csrfToken,
    },
  });
};
