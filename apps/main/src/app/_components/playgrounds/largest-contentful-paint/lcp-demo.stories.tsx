import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { LCPDemo } from './lcp-demo';

const playgroundTitle = LCPDemo.name;

const meta = preview.meta({
  title: 'playgrounds/largest-contentful-paint/LCPDemo',
  component: LCPDemo,
  // PerformanceObserverの実測値（startTime/size等）を表示するデモのため、VRTの対象外にする
  parameters: { vrt: { skip: true } },
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
