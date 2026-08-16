import preview from '../../../../../.storybook/preview';
import { getElement } from '../../_utils/content-model';
import { SpecialContentNotice } from './special-content-notice';

const elementOf = (tag: string) => {
  const element = getElement(tag);
  if (element === undefined) {
    throw new Error(`${tag} が見つかりません`);
  }
  return element;
};

const meta = preview.meta({
  title: 'app/html-nest/special-content-notice',
  component: SpecialContentNotice,
});

export const Transparent = meta.story({ args: { element: elementOf('a') } });
export const Empty = meta.story({ args: { element: elementOf('img') } });
export const Nothing = meta.story({ args: { element: elementOf('iframe') } });
export const Text = meta.story({ args: { element: elementOf('title') } });
export const TextWithNote = meta.story({
  args: { element: elementOf('script') },
});
export const Foreign = meta.story({ args: { element: elementOf('svg') } });
export const Varies = meta.story({ args: { element: elementOf('noscript') } });
