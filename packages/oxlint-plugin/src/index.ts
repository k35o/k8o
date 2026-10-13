import type { Plugin } from 'vite-plus/lint/plugins';

import { databaseImportBoundary } from './database-import-boundary.ts';

const plugin: Plugin = {
  meta: { name: 'k8o' },
  rules: {
    'database-import-boundary': databaseImportBoundary,
  },
};

export default plugin;
