'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Code } from '@k8o/arte-odyssey/code';
import { type FC, useState } from 'react';

export const ContentVisibilityDemo: FC = () => {
  const [showHidden, setShowHidden] = useState(true);
  const [showAuto, setShowAuto] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-bold">
              <Code>content-visibility: hidden</Code>
            </p>
            <Button onClick={() => setShowHidden(!showHidden)} size="sm">
              {showHidden ? 'visible' : 'hidden'}に変更する
            </Button>
          </div>
          <div className="h-96 rounded-md border border-border-base p-4">
            <div
              style={{
                contentVisibility: showHidden ? 'hidden' : 'visible',
              }}
            >
              <h3 className="mb-2 font-bold text-md">サンプルコンテンツ</h3>
              <p className="mb-4">
                このコンテンツは<Code>content-visibility: hidden</Code>
                によって制御されています。非表示の場合、レンダリング処理が行われず、スクリーンリーダーやブラウザ検索からもアクセスできません。
              </p>
              <Button>
                content-visibilityがhiddenなボタン（何も起きません）
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-bold">
              <Code>content-visibility: auto</Code>
            </p>
            <Button onClick={() => setShowAuto(!showAuto)} size="sm">
              {showAuto ? 'visible' : 'auto'}に変更する
            </Button>
          </div>
          <div className="h-96 rounded-md border border-border-base p-4">
            <div
              style={{
                contentVisibility: showAuto ? 'auto' : 'visible',
                // containIntrinsicSize: 'auto calc(var(--spacing) * 96)',
              }}
            >
              <h3 className="mb-2 font-bold text-md">サンプルコンテンツ</h3>
              <p className="mb-4">
                このコンテンツは<Code>content-visibility: auto</Code>
                によって制御されています。ビューポート外の要素のレンダリング処理を必要なタイミングまでスキップできます。
              </p>
              <Button>
                content-visibilityがautoなボタン（何も起きません）
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
