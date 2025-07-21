import { ContactToMe } from './contact-to-me';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { within } from 'storybook/test';

const meta: Meta<typeof ContactToMe> = {
  title: 'app/globals/contact-to-me',
  component: ContactToMe,
};

export default meta;
type Story = StoryObj<typeof ContactToMe>;

export const Primary: Story = {};

export const Open: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'お問い合わせ',
    });
    button.click();
  },
};
