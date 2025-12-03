import './env-config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { type AnyColumn, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { WebSocket } from 'ws';
import { relations, schema } from './schema';

const DATABASE_URL = process.env['POSTGRES_URL'] ?? '';

if (process.env['NODE_ENV'] === 'production') {
  neonConfig.webSocketConstructor = WebSocket;
  neonConfig.poolQueryViaFetch = true;
} else {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

const pool = new Pool({ connectionString: DATABASE_URL });
const drizzleDb = drizzle(pool, {
  schema: {
    ...schema,
    ...relations,
  },
});

// db オブジェクトを拡張して、schema と utils も含める
export const db = Object.assign(drizzleDb, {
  _schema: schema,
  _utils: {
    increment: (column: AnyColumn, value = 1) => sql`${column} + ${value}`,
  },
});
