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
    // プレビューは常に *.vercel.run（HTTPS:443 が 5173 へ proxy）で開く。HMR の websocket も
    // 同じ 443 経由で張れるよう clientPort を固定する（既定だと 5173 へ繋ぎに行き失敗し、
    // コード差し替えが HMR で反映されない）。このテンプレは Sandbox 内でしか dev しないため固定で良い。
    hmr: {
      clientPort: 443,
    },
  },
});
