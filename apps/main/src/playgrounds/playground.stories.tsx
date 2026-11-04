import { Button } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';
import { expect } from 'storybook/test';

import preview from '../../.storybook/preview';
import { Playground } from './playground';

import styles from './playground.stories.module.css';

const meta = preview.meta({
  title: 'playgrounds/Playground',
  component: Playground,
});

const Counter: FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.counter}>
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

// 正常系: 段を渡さなければ、Playground のページの題（h1）の一つ下の h2 で描く
export const Primary = meta.story({
  args: {
    title: 'Counterのサンプル',
    children: <Counter />,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Counterのサンプル' }),
    ).toBeInTheDocument();
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

export const WithHref = meta.story({
  args: {
    title: 'Counterのサンプル',
    description:
      'ブログ埋め込み時は枠の右上にPlaygroundページへのアドレスバー風リンクが付きます。',
    href: '/playgrounds/counter',
    children: <Counter />,
  },
});

// 正常系: 記事に埋め込むときは、置いた節の段から渡された段で描く
export const HeadingLevel = meta.story({
  args: {
    title: 'Counterのサンプル',
    headingLevel: 'h4',
    children: <Counter />,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 4, name: 'Counterのサンプル' }),
    ).toBeInTheDocument();
  },
});
