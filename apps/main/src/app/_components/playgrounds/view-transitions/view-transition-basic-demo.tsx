'use client';

import { Button, Code } from '@k8o/arte-odyssey';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const COLORS = [
  { light: 'var(--red-200)', dark: 'var(--red-800)' },
  { light: 'var(--pink-200)', dark: 'var(--pink-800)' },
  { light: 'var(--purple-200)', dark: 'var(--purple-800)' },
  { light: 'var(--cyan-200)', dark: 'var(--cyan-800)' },
  { light: 'var(--blue-200)', dark: 'var(--blue-800)' },
  { light: 'var(--teal-200)', dark: 'var(--teal-800)' },
  { light: 'var(--green-200)', dark: 'var(--green-800)' },
  { light: 'var(--yellow-200)', dark: 'var(--yellow-800)' },
  { light: 'var(--orange-200)', dark: 'var(--orange-800)' },
] as const;

type Item = {
  id: number;
  text: string;
  color: (typeof COLORS)[number];
};

const getRandomColor = (): (typeof COLORS)[number] =>
  COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0];

const INIT_ITEMS = [
  { id: 1, text: 'アイテム 1', color: COLORS[0] },
  { id: 2, text: 'アイテム 2', color: COLORS[2] },
  { id: 3, text: 'アイテム 3', color: COLORS[4] },
  { id: 4, text: 'アイテム 4', color: COLORS[6] },
] as const satisfies Item[];

export function ViewTransitionBasicDemo() {
  const [count, setCount] = useState<number>(INIT_ITEMS.length);
  const [items, setItems] = useState<Item[]>(INIT_ITEMS);
  const { resolvedTheme } = useTheme();
  const [isViewTransitionEnabled, setIsViewTransitionEnabled] = useState(true);

  const withViewTransition = (updateDOM: () => void) => {
    if (isViewTransitionEnabled && 'startViewTransition' in document) {
      document.startViewTransition(updateDOM);
    } else {
      updateDOM();
    }
  };

  const shuffleItems = () => {
    withViewTransition(() => {
      setItems((prev) => [...prev].toSorted(() => Math.random() - 0.5));
    });
  };

  const addItem = () => {
    withViewTransition(() => {
      const newId = count + 1;
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          text: `アイテム ${newId}`,
          color: getRandomColor(),
        },
      ]);
      setCount(newId);
    });
  };

  const removeItem = (id: number) => {
    withViewTransition(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      <style>{`
        ::view-transition-group(.item) {
          border-radius: var(--radius-md);
          animation-duration: 1000ms;
        }
        ::view-transition-group(item-1) {
          background-color: ${resolvedTheme === 'dark' ? COLORS[0].light : COLORS[0].dark};
        }
        ::view-transition-image-pair(item-2) {
          background-color: ${resolvedTheme === 'dark' ? COLORS[2].light : COLORS[2].dark};
        }
        ::view-transition-old(item-3) {
          background-color: ${resolvedTheme === 'dark' ? COLORS[4].light : COLORS[4].dark};
        }
        ::view-transition-new(item-4) {
          background-color: ${resolvedTheme === 'dark' ? COLORS[6].light : COLORS[6].dark};
        }
      `}</style>
      <div className="flex flex-wrap gap-2">
        <Button onClick={shuffleItems}>シャッフル</Button>
        <Button onClick={addItem}>アイテムを追加</Button>
        <Button
          color={isViewTransitionEnabled ? 'primary' : 'gray'}
          onClick={() => {
            setIsViewTransitionEnabled(!isViewTransitionEnabled);
          }}
        >
          View Transition: {isViewTransitionEnabled ? 'ON' : 'OFF'}
        </Button>
        <Button
          color="primary"
          onClick={() => {
            setItems(INIT_ITEMS);
            setCount(INIT_ITEMS.length);
          }}
        >
          アイテムをリセット
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const bgColor =
            resolvedTheme === 'dark' ? item.color.dark : item.color.light;
          return (
            <li
              className="flex items-center justify-between rounded-md p-4 opacity-80"
              key={item.id}
              style={{
                viewTransitionName: isViewTransitionEnabled
                  ? `item-${item.id}`
                  : 'none',
                viewTransitionClass: 'item',
                backgroundColor: bgColor,
                color: 'var(--white)',
              }}
            >
              <span className="font-bold">{item.text}</span>
              <Button
                onClick={() => {
                  removeItem(item.id);
                }}
                size="sm"
                variant="skeleton"
              >
                削除
              </Button>
            </li>
          );
        })}
      </ul>

      <ul className="flex list-inside list-disc flex-col gap-1 text-sm">
        <li>
          View TransitionのON/OFFの切り替えは<Code>view-transition-name</Code>を
          <Code>none</Code>に指定することで行なっています。
        </li>
        <li>
          View TransitionがONの時は、アイテム番号ごとの
          <Code>view-transition-name</Code>を持ちます（例: <Code>item-1</Code>
          ）。
        </li>
        <li>
          各アイテムは、まとまったスタイルを付与するために
          <Code>view-transition-class: item;</Code>を持ちます。
        </li>
      </ul>
      <pre
        className="my-4 overflow-x-auto rounded-lg px-2 py-1 sm:p-4"
        style={{
          backgroundColor: '#21252B',
          color: '#A9B2C3',
        }}
      >
        <code className="sm:text-md text-xs">
          {`::view-transition-group(.item) {
  border-radius: var(--radius-md);
}
::view-transition-group(item-1) {
  background-color: var(--red-800);
}
::view-transition-image-pair(item-2) {
  background-color: var(--pink-800);
}
::view-transition-old(item-3) {
  background-color: var(--purple-800);
}
::view-transition-new(item-4) {
  background-color: var(--cyan-800);
}`}
        </code>
      </pre>
    </div>
  );
}
