import type { Meta, StoryObj } from '@storybook/react';
import { ToggleTheme } from './toggle-theme';

const meta: Meta<typeof ToggleTheme> = {
  title: 'app/globals/toggle-theme',
  component: ToggleTheme,
};

export default meta;
type Story = StoryObj<typeof ToggleTheme>;

export const Primary: Story = {};
