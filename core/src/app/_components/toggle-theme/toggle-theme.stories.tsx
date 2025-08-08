import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ToggleTheme } from './toggle-theme';

const meta: Meta<typeof ToggleTheme> = {
  title: 'app/globals/toggle-theme',
  component: ToggleTheme,
};

export default meta;
type Story = StoryObj<typeof ToggleTheme>;

export const Primary: Story = {};
