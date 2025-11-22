import '@/database/env-config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { WebSocket } from 'ws';
import { relations, schema } from './schema';

const DATABASE_URL = process.env.POSTGRES_URL ?? '';

if (process.env.NODE_ENV === 'production') {
  neonConfig.webSocketConstructor = WebSocket;
  neonConfig.poolQueryViaFetch = true;
  neonConfig.fetchConnectionCache = true;
} else {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: 10,
});
export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations,
  },
});
