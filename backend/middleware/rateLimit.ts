import { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

type Bucket = { count: number; resetAt: number };

/**
 * Small dependency-free limiter for sensitive endpoints. For a multi-instance
 * deployment this should be replaced with a shared Redis-backed store.
 */
export function rateLimit({ windowMs, max, keyPrefix }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.ip;
    const key = `${keyPrefix}:${clientIp}`;
    const existing = buckets.get(key);
    const bucket = !existing || now >= existing.resetAt
      ? { count: 0, resetAt: now + windowMs }
      : existing;

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, error: 'Too many requests. Please try again shortly.' });
    }

    next();
  };
}
