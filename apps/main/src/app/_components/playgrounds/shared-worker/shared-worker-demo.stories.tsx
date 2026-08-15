import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SharedWorkerDemo } from './shared-worker-demo';

const playgroundTitle = SharedWorkerDemo.name;

const meta = preview.meta({
  title: 'playgrounds/shared-worker/SharedWorkerDemo',
  component: SharedWorkerDemo,
  // SharedWorkerの起動時刻（実時刻）と接続数を表示するデモのため、VRTの対象外にする
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
