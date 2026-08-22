'use client';

import { Button, Code } from '@k8o/arte-odyssey';
import { useState } from 'react';

let nextId = 0;
const createIds = (length: number): number[] =>
  Array.from({ length }, () => nextId++);

export function SiblingCountBarsDemo() {
  const [ids, setIds] = useState(() => createIds(4));

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @property --scid-bar-index {
          syntax: "<integer>";
          inherits: true;
          initial-value: 0;
        }

        .scid-chart {
          display: flex;
          align-items: flex-end;
          min-height: 15rem;
        }

        .scid-cell {
          --scid-bar-index: sibling-index();
          width: calc(100% / sibling-count());
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding-inline: 0.25rem;
          counter-reset: scid-bar sibling-index();
          transition: width 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .scid-cell-bar {
          width: 100%;
          height: calc(var(--scid-bar-index) * 1.5rem + 1.25rem);
          transition:
            height 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
            opacity 320ms ease-out;
        }

        @starting-style {
          .scid-cell-bar {
            height: 0;
            opacity: 0;
          }
        }

        .scid-cell-label::before {
          content: counter(scid-bar);
        }
      `}</style>

      <div className="flex flex-wrap gap-2">
        <Button
          color="base"
          onClick={() => {
            setIds((prev) => [...createIds(1), ...prev]);
          }}
          size="sm"
          variant="outline"
        >
          先頭に追加
        </Button>
        <Button
          color="base"
          onClick={() => {
            setIds((prev) => [...prev, ...createIds(1)]);
          }}
          size="sm"
          variant="outline"
        >
          末尾に追加
        </Button>
        <Button
          color="base"
          disabled={ids.length <= 1}
          onClick={() => {
            setIds((prev) => prev.slice(1));
          }}
          size="sm"
          variant="outline"
        >
          先頭を削除
        </Button>
      </div>

      <div className="bg-bg-subtle rounded-xl p-6">
        <div className="scid-chart">
          {ids.map((id) => (
            <div className="scid-cell" key={id}>
              <div className="scid-cell-bar bg-primary-bg rounded-t-md" />
              <span className="scid-cell-label text-fg-mute text-xs" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-fg-mute text-sm leading-relaxed">
        幅は<Code>calc(100% / sibling-count())</Code>
        、高さは<Code>@property</Code>で登録した
        <Code>--scid-bar-index</Code>に<Code>sibling-index()</Code>
        を入れて内側のバーへ渡しています。ラベルの数字も
        <Code>counter-reset</Code>に渡した<Code>sibling-index()</Code>
        です。先頭に追加すると後続の番号が繰り上がり、高さがそのまま追従します。
      </p>
    </div>
  );
}
