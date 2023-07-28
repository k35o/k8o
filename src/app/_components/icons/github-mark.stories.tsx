import type { Meta, StoryObj } from '@storybook/react';
import { GithubMark } from './github-mark';

const meta: Meta<typeof GithubMark> = {
  title: 'github-mark',
  component: GithubMark,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GithubMark>;

export const Primary: Story = {};
