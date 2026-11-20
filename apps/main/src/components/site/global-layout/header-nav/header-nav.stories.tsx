import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { HeaderNav } from './header-nav';

const meta = preview.meta({
  title: 'app/globals/global-layout/header-nav',
  component: HeaderNav,
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'メイン' });
    const links = within(nav)
      .getAllByRole('link')
      .map((link) => [link.textContent, link.getAttribute('href')]);
    await expect(links).toStrictEqual([
      ['Blog', '/blog'],
      ['Talks', '/talks'],
      ['Artifacts', '/artifacts'],
      ['Readings', '/reading-list'],
    ]);
  },
});

// Storybook の URL はどの区画でもないので、どのリンクも今いるページにならない
export const MarksNoLinkOutsideSections = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole('link')) {
      await expect(link).not.toHaveAttribute('aria-current');
    }
  },
});

export const ShowsFocusRing = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const blog = canvas.getByRole('link', { name: 'Blog' });
    await expect(blog).toHaveFocus();
    await expect(getComputedStyle(blog).boxShadow).not.toBe('none');
  },
});
