import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { HeaderActions } from './header-actions';

const meta: Meta<typeof HeaderActions> = {
  title: 'app/globals/global-layout/header-actions',
  component: HeaderActions,
};

export default meta;
type Story = StoryObj<typeof HeaderActions>;

export const Primary: Story = {};
