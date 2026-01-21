'use client';

import type { Change } from 'diff';
import type { FC } from 'react';

type DiffOutputProps = {
  diff: Change[];
};

export const DiffOutput: FC<DiffOutputProps> = ({ diff }) => {
  if (diff.length === 0) {
    return (
      <p className="text-fg-muted">
        テキストを入力すると、差分がここに表示されます
      </p>
    );
  }

  // 差分がない場合（変更なし）
  const firstDiff = diff[0];
  if (
    diff.length === 1 &&
    firstDiff &&
    !firstDiff.added &&
    !firstDiff.removed
  ) {
    return <p className="text-fg-muted">差分はありません</p>;
  }

  return (
    <div className="whitespace-pre-wrap break-all font-mono text-sm">
      {diff.map((part, index) => {
        if (part.added) {
          return (
            <span className="bg-bg-success text-fg-success" key={index}>
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              className="bg-bg-error text-fg-error line-through"
              key={index}
            >
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
};
