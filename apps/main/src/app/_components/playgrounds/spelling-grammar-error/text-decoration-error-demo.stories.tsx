import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { TextDecorationErrorDemo } from './text-decoration-error-demo';

const playgroundTitle = TextDecorationErrorDemo.name;

const meta: Meta<typeof TextDecorationErrorDemo> = {
  title: 'playgrounds/spelling-grammar-error/TextDecorationErrorDemo',
  component: TextDecorationErrorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextDecorationErrorDemo>;

export const Default: Story = {};
