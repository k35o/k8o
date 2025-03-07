import { ResultTable } from './result-table';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ResultTable> = {
  title: 'app/colors/contrasts/result-table',
  component: ResultTable,
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
    baseColor: '#2dd4bf',
  },
};

export const Invalid: Story = {
  args: {
    isInvalidAAContrstLarge: true,
    isInvalidAAAContrstLarge: true,
    isInvalidAAContrstSmall: true,
    isInvalidAAAContrstSmall: true,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
};

export const ValidOnlyAA: Story = {
  args: {
    isInvalidAAContrstLarge: false,
    isInvalidAAAContrstLarge: true,
    isInvalidAAContrstSmall: false,
    isInvalidAAAContrstSmall: true,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
};
