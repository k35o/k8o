'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Code } from '@k8o/arte-odyssey/code';
import { useState } from 'react';

/**
 * スコープの近接性のデモ
 * DOM距離による優先順位の決定（情報/警告ボックスの例）
 */
export function ScopeProximityDemo() {
  const [showProximity, setShowProximity] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">スコープの近接性</h3>
        <Button
          color={showProximity ? 'primary' : 'gray'}
          onClick={() => setShowProximity(!showProximity)}
          size="sm"
        >
          @scope: {showProximity ? 'ON' : 'OFF'}
        </Button>
      </div>

      <style>
        {showProximity
          ? `
          @scope (.demo-info-box) {
            .demo-message {
              color: var(--color-fg-info);
              background-color: var(--color-bg-info);
              border-left: 4px solid var(--color-border-info);
            }
          }
          @scope (.demo-warning-box) {
            .demo-message {
              color: var(--color-fg-warning);
              background-color: var(--color-bg-warning);
              border-left: 4px solid var(--color-border-warning);
            }
          }
        `
          : `
          .demo-info-box .demo-message {
            color: var(--color-fg-info);
            background-color: var(--color-bg-info);
            border-left: 4px solid var(--color-border-info);
          }
          .demo-warning-box .demo-message {
            color: var(--color-fg-warning);
            background-color: var(--color-bg-warning);
            border-left: 4px solid var(--color-border-warning);
          }
        `}
      </style>

      <div className="demo-info-box rounded-lg border border-border-base p-4">
        <p className="demo-message rounded p-2">情報メッセージ</p>
        <div className="demo-warning-box mt-4 rounded-lg border border-border-base p-4">
          <p className="demo-message rounded p-2">警告メッセージ</p>
          <div className="demo-info-box mt-4 rounded-lg border border-border-base p-4">
            <p className="demo-message rounded p-2">
              ネストされた情報メッセージ（@scopeがONなら近接性で決定）
            </p>
          </div>
        </div>
      </div>

      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          <Code>@scope</Code>がONの場合、最も内側の
          <Code>&lt;p&gt;</Code>は近接性により
          <Code>.info-box</Code>のスタイルが適用されます
        </li>
        <li>
          <Code>@scope</Code>がOFFの場合、通常のカスケードで
          <Code>.warning-box</Code>
          のスタイルが優先されます（後に定義されているため）
        </li>
      </ul>

      <pre className="overflow-x-auto rounded-lg bg-bg-mute px-2 py-1 text-fg-mute text-xs sm:p-4 sm:text-md">
        <code>
          {showProximity
            ? `@scope (.info-box) {
  .message { color: var(--color-fg-info); background: var(--color-bg-info); }
}
@scope (.warning-box) {
  .message { color: var(--color-fg-warning); background: var(--color-bg-warning); }
}`
            : `.info-box .message {
  color: var(--color-fg-info);
  background: var(--color-bg-info);
}
.warning-box .message {
  color: var(--color-fg-warning);
  background: var(--color-bg-warning);
}`}
        </code>
      </pre>
    </div>
  );
}
