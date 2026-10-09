import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    platform: 'node',
    format: 'esm',
    // ワークスペースのパッケージは TS ソースを直接 export しており、拡張子なしの
    // import も含むため、そのままでは Vercel の Node ESM で読めない。
    deps: { alwaysBundle: [/^@repo\//u], onlyBundle: false },
    // package.json の exports（types）は main に公開ルートの型を渡すためのもので、
    // tsdown はそれを見て型も出そうとする。デプロイする dist に型は要らない
    dts: false,
  },
});
