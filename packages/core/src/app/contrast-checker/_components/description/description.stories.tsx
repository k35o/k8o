import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Description } from './description';

const meta: Meta<typeof Description> = {
  title: 'app/contrast-checker/description',
  component: Description,
};

export default meta;
type Story = StoryObj<typeof Description>;

export const Default: Story = {};
