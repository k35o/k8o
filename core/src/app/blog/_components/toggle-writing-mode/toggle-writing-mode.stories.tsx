import {
  ToggleWritingMode,
  WritingModeProvider,
} from './toggle-writing-mode';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof ToggleWritingMode> = {
  title: 'app/blog/toggle-writing-mode',
  component: ToggleWritingMode,
  decorators: [
    (Story) => (
      <WritingModeProvider>
        <Story />
      </WritingModeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToggleWritingMode>;

export const Primary: Story = {};
