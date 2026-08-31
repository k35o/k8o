'use client';

import { Switch } from '@k8ordo/ui';
import { useState } from 'react';

const GHOST = 'text-fg-mute border-border-base rounded-lg border border-dashed';
const ITEM = 'bg-bg-base text-fg-base rounded-lg';
const OPEN_FRUIT = '<div class=&quot;scid-fruit&quot;>';

// style と script を兄弟として数えさせるのが主題だが、JSX で書くと React が hoist
// したり実行を拒んだりして DOM の並びが変わるため、静的な文字列をそのまま挿入する
const NODES_HTML = `<style class="scid-node scid-offscreen ${GHOST}" data-open="<style>" data-close="</style>">.scid-fruit { font-weight: 700; }
.scid-quiet { display: none; }</style>
<div class="scid-node scid-fruit ${ITEM}" data-open="${OPEN_FRUIT}" data-close="</div>">りんご</div>
<div class="scid-node scid-fruit ${ITEM}" data-open="${OPEN_FRUIT}" data-close="</div>">みかん</div>
<div class="scid-node scid-fruit scid-quiet scid-offscreen ${GHOST}" data-open="<div class=&quot;scid-fruit scid-quiet&quot;>" data-close="</div>">ぶどう</div>
<div class="scid-node scid-fruit ${ITEM}" data-open="${OPEN_FRUIT}" data-close="</div>">もも</div>
<script class="scid-node scid-offscreen ${GHOST}" data-open="<script>" data-close="</script>">/* 計測用 */</script>
<div class="scid-node scid-fruit ${ITEM}" data-open="${OPEN_FRUIT}" data-close="</div>">なし</div>`;

export function ElementCountingDemo() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .scid-node {
          counter-reset: scid-index sibling-index();
          display: list-item;
          list-style-position: inside;
          padding: 0.625rem 0.875rem;
          font-family: ui-monospace, monospace;
          font-size: 0.8125rem;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .scid-node + .scid-node {
          margin-top: 0.5rem;
        }

        .scid-node::marker {
          content: counter(scid-index) "\\a0\\a0";
          font-family: ui-monospace, monospace;
        }

        .scid-node::before {
          content: attr(data-open);
        }

        .scid-node::after {
          content: attr(data-close);
        }

        .scid-offscreen {
          display: none;
        }

        .scid-tree-revealed .scid-offscreen {
          display: list-item;
        }
      `}</style>

      <Switch
        checked={revealed}
        label="画面に出ない子要素も表示する"
        onChange={setRevealed}
      />

      <div
        className={`bg-bg-subtle overflow-x-auto rounded-xl p-5 sm:p-6 ${revealed ? 'scid-tree-revealed' : ''}`}
        dangerouslySetInnerHTML={{ __html: NODES_HTML }}
      />

      <p className="text-fg-mute text-sm leading-relaxed">
        見えているものだけだと番号は2、3、5、7と飛びます。スイッチを入れると、1の
        <code className="font-mono">{'<style>'}</code>、4の
        <code className="font-mono">display: none</code>な項目、6の
        <code className="font-mono">{'<script>'}</code>
        が現れて番号がつながります。コメントとテキストノードは番号を消費しません。
      </p>
    </div>
  );
}
