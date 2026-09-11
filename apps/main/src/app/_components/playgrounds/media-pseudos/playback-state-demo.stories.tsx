import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { PlaybackStateDemo } from './playback-state-demo';

const playgroundTitle = PlaybackStateDemo.name;

const meta = preview.meta({
  title: 'playgrounds/media-pseudos/PlaybackStateDemo',
  component: PlaybackStateDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
