import { expect, userEvent } from 'storybook/test';

import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { DonutScopeDemo } from './donut-scope-demo';

const playgroundTitle = DonutScopeDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scope/DonutScopeDemo',
  component: DonutScopeDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();

// 正常系: @scope を外しても、コードの行数でデモの高さが変わらない
export const KeepsHeightOnToggle = meta.story({
  play: async ({ canvas, canvasElement }) => {
    // canvas は画面の高さいっぱいに広がり、中のコードが縮んでも高さが変わらないので、コードを包む要素を測る
    const codeBox = canvasElement.querySelector('pre')?.parentElement;
    if (!codeBox) throw new Error('コードを包む要素が見つかりません');
    const before = codeBox.getBoundingClientRect().height;

    await userEvent.click(canvas.getByRole('button', { name: '@scope: ON' }));

    await expect(
      canvas.getByRole('button', { name: '@scope: OFF' }),
    ).toBeVisible();
    await expect(codeBox.getBoundingClientRect().height).toBe(before);
  },
});
