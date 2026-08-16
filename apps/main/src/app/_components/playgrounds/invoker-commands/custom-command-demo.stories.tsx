import preview from '../../../../../.storybook/preview';
import { CustomCommandDemo } from './custom-command-demo';

const meta = preview.meta({
  component: CustomCommandDemo,
  title: 'playgrounds/CustomCommandDemo',
});

export const Default = meta.story();
