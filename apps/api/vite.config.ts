import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    platform: 'node',
    format: 'esm',
    // ワークスペースのパッケージは TS ソースを直接 export しており、拡張子なしの
    // import も含むため、そのままでは Vercel の Node ESM で読めない。
    deps: { alwaysBundle: [/^@repo\//u], onlyBundle: false },
  },
});
