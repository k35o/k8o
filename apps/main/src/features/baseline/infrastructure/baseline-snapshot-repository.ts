import 'server-only';
import { db } from '@repo/database';
import type { BrowserImplementations } from '@repo/database/schema';
import { inArray } from 'drizzle-orm';

// SQLite の bound variable 上限(SQLITE_LIMIT_VARIABLE_NUMBER, 既定 999)を超えないよう、
// featureId の IN 条件を分割して問い合わせる。
const CHUNK_SIZE = 500;

export async function findBrowserImplementationsByFeatureIds(
  featureIds: string[],
): Promise<BrowserImplementations[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < featureIds.length; i += CHUNK_SIZE) {
    chunks.push(featureIds.slice(i, i + CHUNK_SIZE));
  }

  const rowsPerChunk = await Promise.all(
    chunks.map((chunk) =>
      db
        .select({
          browserImplementations:
            db._schema.baselineSnapshots.browserImplementations,
        })
        .from(db._schema.baselineSnapshots)
        .where(inArray(db._schema.baselineSnapshots.featureId, chunk)),
    ),
  );

  const result: BrowserImplementations[] = [];
  for (const rows of rowsPerChunk) {
    for (const row of rows) {
      if (row.browserImplementations) {
        result.push(row.browserImplementations);
      }
    }
  }
  return result;
}
