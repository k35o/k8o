/// <reference types="vite/client" />
import { ArteOdysseyProvider, ToastProvider } from '@k8o/arte-odyssey';
import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import Preview from './generated/Preview';

// HMR で Preview が差し替わったら親(Studio)へ通知する。Studio はこれを受けてローディングを
// 解除し、iframe の強制リロード（白フラッシュ＋全読込）を省く。websocket が張れず HMR が
// 効かない環境では通知が来ないため、Studio 側はタイムアウトでリロードにフォールバックする。
if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent.postMessage({ type: 'k8o-preview-updated' }, '*');
  });
}

// 初期テーマは index.html の head スクリプトが初回ペイント前に反映する。
// 以降の切替は親からの postMessage で受け、iframe を再読込せず反映する（白フラッシュ回避）。
window.addEventListener('message', (event) => {
  const data: unknown = event.data;
  if (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'k8o-preview-theme'
  ) {
    document.documentElement.classList.toggle(
      'dark',
      'theme' in data && data.theme === 'dark',
    );
  }
});

// 生成コードの runtime 例外（prop 不整合など）を白画面にせず原因を表示する。
type BoundaryState = { message: string | null };

class PreviewErrorBoundary extends Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  render(): ReactNode {
    if (this.state.message !== null) {
      return (
        <div className="bg-bg-surface flex min-h-screen items-center justify-center p-8">
          <div className="bg-bg-base border-border-mute max-w-lg rounded-2xl border p-8 shadow-sm">
            <p className="text-fg-error text-sm font-bold">
              プレビューの描画でエラーが発生しました
            </p>
            <pre className="text-fg-mute mt-3 overflow-auto text-xs leading-relaxed">
              {this.state.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ArteOdysseyProvider>
        <ToastProvider>
          <PreviewErrorBoundary>
            <Preview />
          </PreviewErrorBoundary>
        </ToastProvider>
      </ArteOdysseyProvider>
    </StrictMode>,
  );
}
