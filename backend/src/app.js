import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/env.js';
import apiRoutes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS — explicit origin, credentials enabled for future cookie auth
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request logging
app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

// 4. JSON body parsing with size limit
app.use(express.json({ limit: '10kb' }));

// 5. URL-encoded body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. API routes
app.use('/api/v1', apiRoutes);

// 7. 404 handler for unmatched routes
app.use(notFound);

// 8. Centralized error handler
app.use(errorHandler);

export default app;
