import preview from '../../../../.storybook/preview';
import { ContactToMe } from './contact-to-me';

const meta = preview.meta({
  title: 'app/globals/contact-to-me',
  component: ContactToMe,
});

export const Primary = meta.story();

export const Open = meta.story({
  play: ({ canvas }) => {
    const button = canvas.getByRole('button', {
      name: 'お問い合わせ',
    });
    button.click();
  },
});
