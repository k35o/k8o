import type { Plugin } from '@oxlint/plugins';

import { databaseImportBoundary } from './database-import-boundary.ts';
import { requireVerifySession } from './require-verify-session.ts';

const plugin: Plugin = {
  meta: { name: 'k8o' },
  rules: {
    'database-import-boundary': databaseImportBoundary,
    'require-verify-session': requireVerifySession,
  },
};

export default plugin;
