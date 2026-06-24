import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 生成された UI のプレビュー用テンプレート。
// ローカル開発では vite dev をそのまま動かし、本番では同じ構成を Vercel Sandbox に焼く。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // Vercel Sandbox の *.vercel.run ドメイン経由で開けるよう host チェックを無効化する。
    allowedHosts: true,
  },
});
