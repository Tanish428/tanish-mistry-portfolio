import { doubleCsrf } from 'csrf-csrf';
import config from '../config/env.js';

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => config.csrfSecret,
  getSessionIdentifier: () => 'primary',
  cookieName: config.isProduction ? '__Host-portfolio.x-csrf-token' : 'portfolio.x-csrf-token',
  cookieOptions: {
    sameSite: config.authCookieSameSite,
    path: '/',
    secure: config.authCookieSecure,
    httpOnly: true,
  },
  size: 32,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) =>
    req.headers['x-csrf-token'] || req.headers['csrf-token'] || req.body?._csrf,
  errorConfig: {
    statusCode: 403,
    message: 'Invalid or missing CSRF token',
    code: 'EBADCSRFTOKEN',
  },
});

export { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection };
