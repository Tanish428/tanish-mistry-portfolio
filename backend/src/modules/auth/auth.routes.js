import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  getMe,
  logout,
  getCsrfToken,
} from './auth.controller.js';
import { validateLogin } from './auth.validation.js';
import { authenticate } from './auth.middleware.js';
import { authorizeAdmin } from './authorization.middleware.js';
import { doubleCsrfProtection } from '../../middleware/csrf.js';

const router = Router();

// Rate limiter for login endpoint to mitigate brute-force attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    data: null,
  },
});

// Public endpoints
router.post('/login', loginLimiter, validateLogin, login);
router.get('/csrf-token', getCsrfToken);

// Protected endpoints
router.get('/me', authenticate, authorizeAdmin, getMe);
router.post('/logout', authenticate, doubleCsrfProtection, logout);

export default router;
