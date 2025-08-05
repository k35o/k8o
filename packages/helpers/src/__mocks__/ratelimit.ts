import { fn } from 'storybook/test';

export enum RateLimitType {
  GENERAL = 'general',
  FEEDBACK = 'feedback',
}

export const checkRateLimit = fn();
