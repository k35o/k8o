import { LlmLink } from './llm-link';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof LlmLink> = {
  title: 'app/globals/global-layout/llm-link',
  component: LlmLink,
};

export default meta;
type Story = StoryObj<typeof LlmLink>;

export const Primary: Story = {};
