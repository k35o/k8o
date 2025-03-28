import '@/database/env-config';
import * as schema from './schema';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { WebSocket } from 'ws';

const DATABASE_URL = process.env.POSTGRES_URL ?? '';

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
    return `${protocol}://${host}:${port.toString()}/sql`;
  };
  const connectionStringUrl = new URL(DATABASE_URL);
  neonConfig.useSecureWebSocket =
    connectionStringUrl.hostname !== 'db.localtest.me';
  neonConfig.wsProxy = (host) =>
    host === 'db.localtest.me' ? `${host}:4444/v2` : `${host}/v2`;
}
neonConfig.webSocketConstructor = WebSocket;

const sql = neon(DATABASE_URL);
export const db = drizzle({ client: sql, schema });
