import { Spinner } from '@k8o/arte-odyssey';
import type { FC } from 'react';

// 先行プレビューの「まだ構造が来ていない」フェーズ用ローディング。
// JSX が届き始めたらスケルトン → 実描画の積み上げへ替わる。
export const StreamLoading: FC = () => (
  <div className="flex h-full min-h-40 items-center justify-center p-8">
    <Spinner label="生成しています" size="lg" />
  </div>
);
