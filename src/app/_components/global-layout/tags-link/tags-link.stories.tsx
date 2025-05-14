import { TagsLink } from './tags-link';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TagsLink> = {
  title: 'app/globals/global-layout/tags-link',
  component: TagsLink,
};

export default meta;
type Story = StoryObj<typeof TagsLink>;

export const Primary: Story = {};
