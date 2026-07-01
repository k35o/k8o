import 'server-only';
import { db } from '@repo/database';

export type BrowserSupportRow = {
  browser: string;
  version: string | null;
};

export async function fetchBrowserSupport(): Promise<BrowserSupportRow[]> {
  const rows = await db
    .select({
      browser: db._schema.browserSupport.browser,
      version: db._schema.browserSupport.version,
    })
    .from(db._schema.browserSupport);
  return rows;
}
