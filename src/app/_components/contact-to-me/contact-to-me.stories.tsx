import { ContactToMe } from './contact-to-me';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof ContactToMe> = {
  title: 'app/globals/contact-to-me',
  component: ContactToMe,
};

export default meta;
type Story = StoryObj<typeof ContactToMe>;

export const Primary: Story = {};

export const Open: Story = {};
