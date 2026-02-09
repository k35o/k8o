import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { SelectionMethods } from './selection-methods';

const playgroundTitle = SelectionMethods.name;

const meta: Meta<typeof SelectionMethods> = {
  title: 'playgrounds/composed-ranges/SelectionMethods',
  component: SelectionMethods,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectionMethods>;

export const Default: Story = {};
