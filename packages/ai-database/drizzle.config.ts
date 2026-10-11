import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  schema: './src/schema',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env['AI_TURSO_DATABASE_URL'] ?? '',
    authToken: process.env['AI_TURSO_AUTH_TOKEN'],
  },
});
