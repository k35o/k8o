import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@libsql/client';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

async function seed() {
  const authToken = process.env['TURSO_AUTH_TOKEN'];
  const client = createClient({
    url: process.env['TURSO_DATABASE_URL'] ?? '',
    ...(authToken && { authToken }),
  });

  const sqlPath = join(import.meta.dirname, '../seeds/initial-data.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // 各INSERT文を個別に実行
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.startsWith('INSERT'));

  console.log(`Executing ${statements.length} statements...`);

  // 順次実行が必要なためreduceを使用
  await statements.reduce(async (prev, statement) => {
    await prev;
    try {
      await client.execute(statement);
    } catch (error) {
      console.error(`Error executing: ${statement.substring(0, 100)}...`);
      console.error(error);
    }
  }, Promise.resolve());

  console.log('Seed completed');
}

seed().catch(console.error);
