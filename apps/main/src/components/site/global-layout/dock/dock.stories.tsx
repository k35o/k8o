import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { Dock } from './dock';

const meta = preview.meta({
  title: 'app/globals/global-layout/dock',
  component: Dock,
  // 行き先とページの項目が並ぶのは狭い幅のドック
  globals: { viewport: { value: 'mobile1' } },
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

export const OpensLab = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Lab' }));
    const panel = await canvas.findByRole('dialog', { name: 'Lab' });
    const links = within(panel)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    await expect(links).toStrictEqual([
      '/color-quiz',
      'https://fluida.k8o.me',
      '/browser-support',
    ]);
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

// Lab の行き先を選ぶと、パネルを閉じる
export const ClosesLabOnNavigate = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Lab' });
    await userEvent.click(trigger);
    const link = await canvas.findByRole('link', { name: /カラーHexクイズ/ });
    // 試験では移らせない。閉じるのは押したときで、移った先を待たない
    link.addEventListener('click', (event) => {
      event.preventDefault();
    });
    await userEvent.click(link);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
});
