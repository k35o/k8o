import { Button } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

import preview from '../../../../.storybook/preview';
import { Playground } from './playground';

const meta = preview.meta({
  title: 'playgrounds/Playground',
  component: Playground,
});

const Counter: FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p>{count}</p>
      <Button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        Increment
      </Button>
    </div>
  );
};

export const Primary = meta.story({
  args: {
    title: 'Counterのサンプル',
    children: <Counter />,
  },
});

export const WithDescription = meta.story({
  args: {
    title: 'Counterのサンプル',
    description:
      'ボタンを押すとカウントが1ずつ増えます。デモの説明文はタイトルの下に表示されます。',
    children: <Counter />,
  },
});
