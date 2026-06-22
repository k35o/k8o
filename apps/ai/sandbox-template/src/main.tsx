import { ArteOdysseyProvider, ToastProvider } from '@k8o/arte-odyssey';
import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import Preview from './generated/Preview';

// 親(Studio)から ?theme=dark で渡されたテーマを反映する（arte-odyssey は .dark で切替）。
if (new URLSearchParams(window.location.search).get('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

// 生成コードが描画時に例外を投げても白画面にせず、原因を読める形で出す。
// （存在しない import は親側で書き込み前に弾くが、prop 不整合などの runtime 例外はここで受ける）
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
