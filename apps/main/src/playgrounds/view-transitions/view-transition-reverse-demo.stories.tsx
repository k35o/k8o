import { expect, userEvent, waitFor } from 'storybook/test';

import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { ViewTransitionReverseDemo } from './view-transition-reverse-demo';

const playgroundTitle = ViewTransitionReverseDemo.name;

const meta = preview.meta({
  title: 'playgrounds/view-transitions/ViewTransitionReverseDemo',
  component: ViewTransitionReverseDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();

// 正常系: ボタンを押すと、並びが逆になる
export const ReversesOrder = meta.story({
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: '並びを逆にする' }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(['C', 'B', 'A']);
    });
  },
});
