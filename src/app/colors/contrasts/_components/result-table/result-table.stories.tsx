import type { Meta, StoryObj } from '@storybook/react';
import { ResultTable } from './result-table';

const meta: Meta<typeof ResultTable> = {
  title: 'app/colors/contrasts/result-table',
  component: ResultTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResultTable>;

export const Valid: Story = {
  args: {
    isInvalidAAContrstLarge: false,
    isInvalidAAAContrstLarge: false,
    isInvalidAAContrstSmall: false,
    isInvalidAAAContrstSmall: false,
    compareColor: '#000000',
    baseColor: '#cbd5e1',
  },
};

export const Invalid: Story = {
  args: {
    isInvalidAAContrstLarge: true,
    isInvalidAAAContrstLarge: true,
    isInvalidAAContrstSmall: true,
    isInvalidAAAContrstSmall: true,
    compareColor: '#000000',
    baseColor: '#cbd5e1',
  },
};

export const ValidOnlyAA: Story = {
  args: {
    isInvalidAAContrstLarge: false,
    isInvalidAAAContrstLarge: true,
    isInvalidAAContrstSmall: false,
    isInvalidAAAContrstSmall: true,
    compareColor: '#000000',
    baseColor: '#cbd5e1',
  },
};
