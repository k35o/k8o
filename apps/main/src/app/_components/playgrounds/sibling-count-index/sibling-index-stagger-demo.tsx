'use client';

import { Button, Code, FormControl, Slider } from '@k8o/arte-odyssey';
import { useState } from 'react';

export function SiblingIndexStaggerDemo() {
  const [count, setCount] = useState(5);
  const [playKey, setPlayKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes sci-stagger-fade-in {
          from {
            opacity: 0;
            translate: 0 8px;
          }
          to {
            opacity: 1;
            translate: 0 0;
          }
        }

        .sci-stagger-item {
          counter-reset: sci-index sibling-index();
          animation-name: sci-stagger-fade-in;
          animation-duration: 320ms;
          animation-fill-mode: backwards;
          animation-delay: calc(sibling-index() * 90ms);
        }

        .sci-stagger-item::before {
          content: counter(sci-index) "番目の項目";
        }
      `}</style>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex-1">
          <FormControl
            label={`項目数: ${String(count)}`}
            renderInput={({ 'aria-labelledby': _, ...props }) => (
              <Slider
                {...props}
                max={8}
                min={2}
                onChange={setCount}
                value={count}
              />
            )}
          />
        </div>
        <Button
          color="base"
          onClick={() => {
            setPlayKey((prev) => prev + 1);
          }}
          variant="outline"
        >
          もう一度再生
        </Button>
      </div>

      <ul
        className="flex list-none flex-col gap-2 p-0"
        key={`${String(count)}-${String(playKey)}`}
      >
        {Array.from({ length: count }, (_, index) => (
          <li
            className="sci-stagger-item bg-bg-subtle text-fg-base rounded-md px-4 py-3 text-sm"
            key={index}
          />
        ))}
      </ul>

      <p className="text-fg-mute text-sm">
        遅延は<Code>animation-delay: calc(sibling-index() * 90ms)</Code>
        、行頭の番号は<Code>counter-reset</Code>に渡した
        <Code>sibling-index()</Code>
        です。項目数を変えても、マークアップ側で番号を配り直す必要はありません。
      </p>
    </div>
  );
}
