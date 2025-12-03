import './src/env-config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['POSTGRES_URL'] ?? '',
  },
});
