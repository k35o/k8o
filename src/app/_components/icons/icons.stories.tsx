import type { Meta, StoryObj } from '@storybook/react';
import { GithubMark } from './github-mark';

const meta: Meta<typeof SVGAElement> = {
  title: 'icons',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GithubMark>;

export const Icons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div>
        <GithubMark className="h-24 w-24" />
        <p className="text-center">GitHub Mark</p>
      </div>
    </div>
  ),
};
