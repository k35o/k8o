import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { getElement } from '../../_utils/content-model';
import { ContainmentView } from './containment-view';

const elementOf = (tag: string) => {
  const element = getElement(tag);
  if (element === undefined) {
    throw new Error(`${tag} が見つかりません`);
  }
  return element;
};

const meta: Meta<typeof ContainmentView> = {
  title: 'app/html-nest/containment-view',
  component: ContainmentView,
  args: {
    onSelect: fn(() => {}),
  },
};

export default meta;
type Story = StoryObj<typeof ContainmentView>;

export const Div: Story = { args: { element: elementOf('div') } };
export const ListUl: Story = { args: { element: elementOf('ul') } };
export const VoidImg: Story = { args: { element: elementOf('img') } };
export const TransparentA: Story = { args: { element: elementOf('a') } };
export const RootHtml: Story = { args: { element: elementOf('html') } };
