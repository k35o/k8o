import { fn } from 'storybook/test';

export const RateLimitType = {
  GENERAL: 'general',
  FEEDBACK: 'feedback',
} as const;

export type RateLimitType = (typeof RateLimitType)[keyof typeof RateLimitType];

export const checkRateLimit = fn();

export const ratelimit = {
  limit: fn(),
};
