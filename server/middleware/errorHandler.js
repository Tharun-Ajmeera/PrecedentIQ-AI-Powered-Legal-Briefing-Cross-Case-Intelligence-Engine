// server/middleware/errorHandler.js
import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: `File upload error: ${err.message}`,
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
