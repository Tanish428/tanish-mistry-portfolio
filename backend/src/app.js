import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/env.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import apiRoutes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// 0. Configure reverse proxy trust
app.set('trust proxy', config.trustProxy);

// 1. Security headers
app.use(helmet());

// 2. CORS — explicit origin, credentials enabled for cookie-based authentication
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'csrf-token'],
  })
);

// 3. Request logging
app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

// 4. JSON body parsing with size limit
app.use(express.json({ limit: '10kb' }));

// 5. URL-encoded body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Cookie parser for reading HttpOnly and CSRF cookies
app.use(cookieParser());

// 7. Sanitize incoming request against MongoDB operator injection
app.use(mongoSanitize);

// 8. API routes
app.use('/api/v1', apiRoutes);

// 9. 404 handler for unmatched routes
app.use(notFound);

// 10. Centralized error handler
app.use(errorHandler);

export default app;
