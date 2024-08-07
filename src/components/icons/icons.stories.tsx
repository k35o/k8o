import type { Meta, StoryObj } from '@storybook/react';
import { GithubMark } from './github-mark';
import { Zenn } from './zenn';
import { Twitter } from './twitter';
import { Qiita } from './qiita';

const meta: Meta<typeof SVGAElement> = {
  title: 'components/icons',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GithubMark>;

export const Icons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div>
        <GithubMark className="size-24" />
        <p className="text-center">GitHub Mark</p>
      </div>
      <div>
        <Twitter className="size-24" />
        <p className="text-center">Twitter</p>
      </div>
      <div>
        <Qiita className="size-24" />
        <p className="text-center">qiita</p>
      </div>
      <div>
        <Zenn className="size-24" />
        <p className="text-center">Zenn</p>
      </div>
    </div>
  ),
};
