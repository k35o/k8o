import { fileURLToPath } from 'node:url';

import betterCssModules from '@better-css-modules/vite';
import { defineConfig } from 'vite';

import floor from '../../main/src/features/browser-support/infrastructure/browser-min-versions.json' with { type: 'json' };
import { browserTargets } from '../src/site/browser-targets.ts';

const targets = browserTargets(floor.minVersions);

// Storybook とその vitest の project が読む。部品を描くのに要る CSS の扱いと alias だけを
// アプリの vite.config.ts とそろえる
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  },
  plugins: [betterCssModules()],
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets: targets.lightningcss },
  },
});
