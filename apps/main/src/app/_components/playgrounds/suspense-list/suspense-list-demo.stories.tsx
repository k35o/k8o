import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { SuspenseListDemo } from './suspense-list-demo';

const playgroundTitle = SuspenseListDemo.name;

const meta: Meta<typeof SuspenseListDemo> = {
  title: 'playgrounds/suspense-list/SuspenseListDemo',
  component: SuspenseListDemo,
  // デモのsleep（最長2000ms）が全て解決した決定的な最終状態を撮影する
  parameters: { vrt: { delay: 2500 } },
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SuspenseListDemo>;

export const Default: Story = {};
