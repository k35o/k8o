import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { FieldSizingDemo } from './field-sizing-demo';

const playgroundTitle = FieldSizingDemo.name;

const meta: Meta<typeof FieldSizingDemo> = {
  title: 'playgrounds/field-sizing/FieldSizingDemo',
  component: FieldSizingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FieldSizingDemo>;

export const Default: Story = {};
