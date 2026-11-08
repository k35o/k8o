import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { ExtTextureNorm16Demo } from './ext-texture-norm16-demo';

const playgroundTitle = ExtTextureNorm16Demo.name;

const meta = preview.meta({
  title: 'playgrounds/ext-texture-norm16/ExtTextureNorm16Demo',
  component: ExtTextureNorm16Demo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
