import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { db } from './db';

const allowedEmails = new Set(
  (process.env['ALLOWED_EMAILS'] ?? '').split(',').filter(Boolean),
);

// 許可リストはサインアップ時のみでなくセッション検証のたびに再評価する（失効ギャップ
// 対策）。verifySession から参照される。
export const isAllowedEmail = (email: string): boolean =>
  allowedEmails.has(email);

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
  account: {
    // DB 漏洩時の露出を抑えるため OAuth トークンを暗号化保存する。
    // 本アプリはトークンを利用しない（ログイン用途のみ）ため復号経路は無い。
    encryptOAuthTokens: true,
  },
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        // Better Authの型がPromiseを要求
        before: (user) => {
          if (!isAllowedEmail(user.email)) {
            return Promise.resolve(false);
          }
          return Promise.resolve(undefined);
        },
      },
    },
  },
});
