import config from '../config/env.js';

// eslint-disable-next-line no-unused-vars -- Express requires 4 params to identify error middleware
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  if (config.isDevelopment) {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // Malformed JSON from body parser
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large';
  }

  // In production, do not expose internal error details for 500s
  if (config.isProduction && statusCode === 500) {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: config.isDevelopment ? { stack: err.stack } : null,
  });
};

export default errorHandler;
