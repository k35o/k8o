import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { DragDropDemo } from './drag-drop-demo';

const playgroundTitle = DragDropDemo.name;

const meta: Meta<typeof DragDropDemo> = {
  title: 'playgrounds/caret-position-from-point/DragDropDemo',
  component: DragDropDemo,
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

type Story = StoryObj<typeof DragDropDemo>;

export const Default: Story = {};
