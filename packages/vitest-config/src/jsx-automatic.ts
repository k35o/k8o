import type { Plugin } from 'vitest/config';

export const jsxAutomaticPlugin: Plugin = {
  name: 'vitest-jsx-automatic',
  config: () => ({
    esbuild: { jsx: 'automatic' },
    oxc: { jsx: { runtime: 'automatic' } },
  }),
};
