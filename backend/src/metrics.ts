import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry to register the metrics
export const register = new client.Registry();

// Add default metrics (CPU, Memory, Event Loop, Garbage Collection, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'vellvista_',
});

// Custom metric: Total HTTP Requests
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed by Express server',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestCounter);

// Custom metric: HTTP Request Duration in Seconds
export const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
register.registerMetric(httpRequestDurationHistogram);

/**
 * Express Middleware to track request duration and count metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip metrics collection for /metrics endpoint itself to avoid noise
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Normalize route path to prevent high cardinality metric labels
    let route = req.route ? req.route.path : req.path;
    if (route) {
      // Replace dynamic IDs in path (numeric or UUID) with :id placeholder
      route = route.replace(/\/[0-9a-fA-F-]{16,}/g, '/:id').replace(/\/\d+/g, '/:id');
    } else {
      route = 'unknown';
    }

    const statusCode = res.statusCode.toString();
    const method = req.method;

    httpRequestCounter.inc({ method, route, status_code: statusCode });
    httpRequestDurationHistogram.observe({ method, route, status_code: statusCode }, durationInSeconds);
  });

  next();
}

/**
 * Route handler for exposing Prometheus metrics at /metrics
 */
export async function metricsHandler(req: Request, res: Response): Promise<void> {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (error) {
    res.status(500).send(error);
  }
}
