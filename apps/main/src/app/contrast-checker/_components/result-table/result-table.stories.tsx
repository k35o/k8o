import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ResultTable } from './result-table';

const meta: Meta<typeof ResultTable> = {
  title: 'app/contrast-checker/result-table',
  component: ResultTable,
};

export default meta;
type Story = StoryObj<typeof ResultTable>;

export const Valid: Story = {
  args: {
    isInvalidAaLargeText: false,
    isInvalidAaaLargeText: false,
    isInvalidAaNormalText: false,
    isInvalidAaaNormalText: false,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
};

export const Invalid: Story = {
  args: {
    isInvalidAaLargeText: true,
    isInvalidAaaLargeText: true,
    isInvalidAaNormalText: true,
    isInvalidAaaNormalText: true,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
};

export const ValidOnlyAA: Story = {
  args: {
    isInvalidAaLargeText: false,
    isInvalidAaaLargeText: true,
    isInvalidAaNormalText: false,
    isInvalidAaaNormalText: true,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
};
