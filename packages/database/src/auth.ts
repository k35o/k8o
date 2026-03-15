import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

const allowedEmails = (process.env['ALLOWED_EMAILS'] ?? '')
  .split(',')
  .filter(Boolean);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  socialProviders: {
    github: {
      clientId: process.env['GITHUB_CLIENT_ID'] ?? '',
      clientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? '',
    },
  },
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        // biome-ignore lint/suspicious/useAwait: Better Authの型がPromiseを要求
        before: async (user) => {
          if (!allowedEmails.includes(user.email)) {
            return false;
          }
          return;
        },
      },
    },
  },
});
