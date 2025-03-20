import { CommingSoon } from './comming-soon';
import { Anchor } from '@/components/anchor';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CommingSoon> = {
  title: 'app/globals/comming-soon',
  component: CommingSoon,
};

export default meta;
type Story = StoryObj<typeof CommingSoon>;

export const Primary: Story = {};

export const HasDescription: Story = {
  args: {
    description: (
      <p className="text-fg-mute text-sm">
        コンポーネントの一覧を管理する
        <Anchor href="https://main--647acebb9da23d6c605c4afd.chromatic.com/">
          Storybook
        </Anchor>
        は閲覧できます。
      </p>
    ),
  },
};
