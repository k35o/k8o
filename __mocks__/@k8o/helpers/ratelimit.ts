import { fn } from 'storybook/test';

export const RateLimitType = {
  GENERAL: 'general',
  FEEDBACK: 'feedback',
} as const;

export const checkRateLimit = fn();
