import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { IntlLocaleInfoDemo } from './intl-locale-info-demo';

const playgroundTitle = IntlLocaleInfoDemo.name;

const meta = preview.meta({
  title: 'playgrounds/intl-locale-info/IntlLocaleInfoDemo',
  component: IntlLocaleInfoDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
