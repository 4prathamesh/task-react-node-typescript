import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min

  max: 10,

  message: {
    message: 'Too many login attempts. Please try again later.',
  },

  standardHeaders: true,

  legacyHeaders: false,
});