import { Color } from './color';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof Color> = {
  title: 'app/design-system/color',
  component: Color,
  decorators: [
    (Story) => (
      <div className="bg-bg-base -m-6 min-h-screen p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      options: {
        rules: {
          // コントラスト比が合わない組み合わせもあえて表示しているので無視させる
          'color-contrast': { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Color>;

export const Primary: Story = {};
