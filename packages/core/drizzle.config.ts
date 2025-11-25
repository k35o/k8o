import '@/database/env-config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['POSTGRES_URL'] ?? '',
  },
});
