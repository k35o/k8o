import { Anchor } from '@k8o/arte-odyssey/anchor';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CommingSoon } from './comming-soon';

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
        <Anchor href="https://687a213c85e2e4589d8db1bb-mwvjqfhwpz.chromatic.com/">
          Storybook
        </Anchor>
        は閲覧できます。
      </p>
    ),
  },
};
