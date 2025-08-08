import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Color } from './color';

const meta: Meta<typeof Color> = {
  title: 'app/design-system/color',
  component: Color,
  decorators: [
    (Story) => (
      <div className="-m-6 min-h-screen bg-bg-base p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Color>;

export const Primary: Story = {};
