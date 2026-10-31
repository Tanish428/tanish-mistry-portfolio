import dotenv from 'dotenv';

dotenv.config();

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

const config = Object.freeze({
  nodeEnv,
  port,
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
});

export default config;
