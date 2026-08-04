import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { IntlLocaleInfoDemo } from './intl-locale-info-demo';

const playgroundTitle = IntlLocaleInfoDemo.name;

const meta: Meta<typeof IntlLocaleInfoDemo> = {
  title: 'playgrounds/intl-locale-info/IntlLocaleInfoDemo',
  component: IntlLocaleInfoDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof IntlLocaleInfoDemo>;

export const Default: Story = {};
