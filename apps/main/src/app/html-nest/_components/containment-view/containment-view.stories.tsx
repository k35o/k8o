import { fn } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { getElement } from '../../_utils/content-model';
import { ContainmentView } from './containment-view';

const elementOf = (tag: string) => {
  const element = getElement(tag);
  if (element === undefined) {
    throw new Error(`${tag} が見つかりません`);
  }
  return element;
};

const meta = preview.meta({
  title: 'app/html-nest/containment-view',
  component: ContainmentView,
  args: {
    onSelect: fn(() => {}),
  },
});

export const Div = meta.story({ args: { element: elementOf('div') } });
export const ListUl = meta.story({ args: { element: elementOf('ul') } });
export const VoidImg = meta.story({ args: { element: elementOf('img') } });
export const TransparentA = meta.story({ args: { element: elementOf('a') } });
export const RootHtml = meta.story({ args: { element: elementOf('html') } });
