import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { CaretPositionDemo } from './caret-position-demo';

const playgroundTitle = CaretPositionDemo.name;

const meta = preview.meta({
  title: 'playgrounds/caret-position-from-point/CaretPositionDemo',
  component: CaretPositionDemo,
  // ヒント行の「↑」記号のフォント解決が走行ごとに揺れる（Noto Sans JPの
  // サブセット外グリフのフォールバック差）ため、VRTの対象外にする
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
