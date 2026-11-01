import dotenv from 'dotenv';
import net from 'node:net';

dotenv.config();

/**
 * Parses and validates TRUST_PROXY environment configuration.
 * Supports boolean false/true, non-negative integer hop counts,
 * Express predefined keywords (loopback, linklocal, uniquelocal),
 * IP addresses, and CIDR subnet notations.
 *
 * @param {string|number|boolean|undefined} val
 * @returns {boolean|number|string}
 */
export const parseTrustProxy = (val) => {
  if (val === undefined || val === null || val === false) {
    return false;
  }
  if (val === true) {
    return true;
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val) && val >= 0) {
      return val;
    }
    throw new Error('TRUST_PROXY hop count must be a non-negative integer');
  }

  const str = String(val).trim();
  if (str === '') {
    return false;
  }

  const lower = str.toLowerCase();
  if (lower === 'false') {
    return false;
  }
  if (lower === 'true') {
    return true;
  }

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    throw new Error('TRUST_PROXY cannot be an empty list');
  }

  const validKeywords = ['loopback', 'linklocal', 'uniquelocal'];
  for (const part of parts) {
    if (validKeywords.includes(part.toLowerCase())) {
      continue;
    }
    if (net.isIP(part)) {
      continue;
    }
    if (part.includes('/')) {
      const [ip, maskStr] = part.split('/');
      const ipVer = net.isIP(ip);
      const mask = parseInt(maskStr, 10);
      if (ipVer === 4 && /^\d+$/.test(maskStr) && mask >= 0 && mask <= 32) {
        continue;
      }
      if (ipVer === 6 && /^\d+$/.test(maskStr) && mask >= 0 && mask <= 128) {
        continue;
      }
    }
    throw new Error(
      `Invalid TRUST_PROXY component: "${part}". Must be a boolean (true/false), non-negative integer hop count, or valid IP/CIDR/keyword (loopback, linklocal, uniquelocal).`
    );
  }

  return str;
};

const requiredVars = ['MONGODB_URI', 'DB_NAME', 'CLIENT_URL', 'JWT_SECRET'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `FATAL: Missing required environment variables: ${missing.join(', ')}`
  );
  process.exit(1);
}

const port = parseInt(process.env.PORT || '5000', 10);

if (Number.isNaN(port) || port < 1 || port > 65535) {
  console.error(
    `FATAL: Invalid PORT "${process.env.PORT}". Must be a number between 1 and 65535.`
  );
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

const authCookieSecure = isProduction
  ? true
  : process.env.AUTH_COOKIE_SECURE === 'true';

const validSameSite = ['lax', 'strict', 'none'];
const authCookieSameSite = validSameSite.includes(
  (process.env.AUTH_COOKIE_SAME_SITE || '').toLowerCase()
)
  ? process.env.AUTH_COOKIE_SAME_SITE.toLowerCase()
  : 'lax';

let trustProxy = false;
try {
  trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
} catch (error) {
  console.error(`FATAL: ${error.message}`);
  process.exit(1);
}

const config = Object.freeze({
  nodeEnv,
  port,
  trustProxy,
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME,
  clientUrl: process.env.CLIENT_URL,
  isDevelopment,
  isProduction,

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtIssuer: process.env.JWT_ISSUER || 'tanish-portfolio-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'tanish-portfolio-admin',

  // Cookie configuration
  authCookieName: process.env.AUTH_COOKIE_NAME || 'portfolio_admin_token',
  authCookieSecure,
  authCookieSameSite,

  // CSRF secret
  csrfSecret: process.env.CSRF_SECRET || process.env.JWT_SECRET,

  // Cloudinary configuration
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'portfolio',
  isCloudinaryConfigured: Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ),
});

export default config;
