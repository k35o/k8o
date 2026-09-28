import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { AnnouncementDemo } from './announcement-demo';

const playgroundTitle = AnnouncementDemo.name;

const meta = preview.meta({
  title: 'playgrounds/arianotify/AnnouncementDemo',
  component: AnnouncementDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
