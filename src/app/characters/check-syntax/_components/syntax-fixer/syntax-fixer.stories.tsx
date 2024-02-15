import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxFixer } from './syntax-fixer';

const meta: Meta<typeof SyntaxFixer> = {
  title: 'app/characters/check-syntax/syntax-fixer',
  component: SyntaxFixer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SyntaxFixer>;

export const Primary: Story = {};
