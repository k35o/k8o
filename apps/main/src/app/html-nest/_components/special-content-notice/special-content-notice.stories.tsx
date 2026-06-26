import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { getElement } from '../../_utils/content-model';
import { SpecialContentNotice } from './special-content-notice';

const elementOf = (tag: string) => {
  const element = getElement(tag);
  if (element === undefined) {
    throw new Error(`${tag} が見つかりません`);
  }
  return element;
};

const meta: Meta<typeof SpecialContentNotice> = {
  title: 'app/html-nest/special-content-notice',
  component: SpecialContentNotice,
};

export default meta;
type Story = StoryObj<typeof SpecialContentNotice>;

export const Transparent: Story = { args: { element: elementOf('a') } };
export const Empty: Story = { args: { element: elementOf('img') } };
export const Text: Story = { args: { element: elementOf('title') } };
export const Foreign: Story = { args: { element: elementOf('svg') } };
export const Varies: Story = { args: { element: elementOf('noscript') } };
