import { randomBytes } from 'node:crypto';

const SHARE_SLUG = /^[A-Za-z0-9_-]{16}$/u;

export const newShareSlug = (): string => randomBytes(12).toString('base64url');

export const isShareSlug = (slug: string): boolean => SHARE_SLUG.test(slug);
