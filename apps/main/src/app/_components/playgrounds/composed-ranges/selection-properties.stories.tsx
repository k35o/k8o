import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { SelectionProperties } from './selection-properties';

const playgroundTitle = SelectionProperties.name;

const meta: Meta<typeof SelectionProperties> = {
  title: 'playgrounds/composed-ranges/SelectionProperties',
  component: SelectionProperties,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectionProperties>;

export const Default: Story = {};
