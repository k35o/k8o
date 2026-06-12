import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { CaretPositionDemo } from './caret-position-demo';

const playgroundTitle = CaretPositionDemo.name;

const meta: Meta<typeof CaretPositionDemo> = {
  title: 'playgrounds/caret-position-from-point/CaretPositionDemo',
  component: CaretPositionDemo,
  // ヒント行の「↑」記号のフォント解決が走行ごとに揺れる（Noto Sans JPの
  // サブセット外グリフのフォールバック差）ため、VRTの対象外にする
  parameters: { vrt: { skip: true } },
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CaretPositionDemo>;

export const Default: Story = {};
