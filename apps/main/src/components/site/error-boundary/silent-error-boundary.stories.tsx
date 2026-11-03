import { NavigationGeneration } from '@k8ordo/router';
import { useState } from 'react';
import type { ComponentProps, FC, ReactNode } from 'react';
import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { SilentErrorBoundary } from './silent-error-boundary';

let failing = true;

const Recommend: FC = () => {
  if (failing) {
    throw new Error('関連記事の描画に失敗しました');
  }
  return <p>関連記事</p>;
};

// k8ordo の router が新しいページの木を当てるたびに替える値を、ボタンで替える
const Navigation: FC<{ children: ReactNode }> = ({ children }) => {
  const [generation, setGeneration] = useState(0);

  return (
    <NavigationGeneration value={generation}>
      <button
        onClick={() => {
          setGeneration((current) => current + 1);
        }}
        type="button"
      >
        別のページへ移る
      </button>
      {children}
    </NavigationGeneration>
  );
};

const meta = preview.meta({
  title: 'app/globals/silent-error-boundary',
  component: SilentErrorBoundary,
  // children は render で描くので、args の型を満たすためだけに置く
  args: { children: null } satisfies Partial<
    ComponentProps<typeof SilentErrorBoundary>
  >,
  render: () => (
    <Navigation>
      <p>記事の本文</p>
      <SilentErrorBoundary>
        <Recommend />
      </SilentErrorBoundary>
    </Navigation>
  ),
  beforeEach: () => {
    failing = true;
  },
});

export const ChildFails = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('記事の本文')).toBeInTheDocument();
    await expect(canvas.queryByText('関連記事')).not.toBeInTheDocument();
  },
});

export const RecoverOnNavigation = meta.story({
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText('記事の本文');

    failing = false;
    await userEvent.click(
      canvas.getByRole('button', { name: '別のページへ移る' }),
    );

    await expect(await canvas.findByText('関連記事')).toBeInTheDocument();
  },
});
