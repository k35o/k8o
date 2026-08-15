import preview from '../../../../../../.storybook/preview';
import { ProgressBar } from './progress-bar';

const meta = preview.meta({
  title: 'app/slides/slide-deck/progress-bar',
  component: ProgressBar,
});

export const Start = meta.story({
  args: { current: 0, total: 5 },
});

export const Middle = meta.story({
  args: { current: 2, total: 5 },
});

export const End = meta.story({
  args: { current: 4, total: 5 },
});
