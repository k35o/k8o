import { expect, userEvent, waitFor } from 'storybook/test';

import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { ViewTransitionPseudoDemo } from './view-transition-pseudo-demo';

const playgroundTitle = ViewTransitionPseudoDemo.name;

const meta = preview.meta({
  title: 'playgrounds/view-transitions/ViewTransitionPseudoDemo',
  component: ViewTransitionPseudoDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();

// 正常系: 大きくすると、ボタンが小さくする操作に変わる
export const TogglesSize = meta.story({
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '大きくする' }));

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: '小さくする' }),
      ).toBeInTheDocument();
    });
  },
});
