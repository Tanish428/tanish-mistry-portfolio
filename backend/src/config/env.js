import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['MONGODB_URI', 'DB_NAME', 'CLIENT_URL'];
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

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME,
  clientUrl: process.env.CLIENT_URL,
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
});

export default config;
