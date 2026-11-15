import { ColorSchemeProvider } from '@k8ordo/color-scheme';
import type { FC } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { useResolvedScheme } from './use-resolved-scheme';

const Probe: FC<{ onRender: (scheme: string | null) => void }> = ({
  onRender,
}) => {
  const scheme = useResolvedScheme();
  onRender(scheme);
  return <output>{scheme ?? '未定'}</output>;
};

const meta = preview.meta({
  component: Probe,
  args: { onRender: () => undefined },
});

export const Default = meta.story();

// サーバーで描いた HTML を置いてから hydrate し、描画ごとの値を並べる。dark を選んだ利用者に、
// light を一度も返さない
export const NeverLightForDarkVisitor = meta.story({
  parameters: { theme: 'dark', vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(document.documentElement).toHaveClass('dark');
    });
    const rendered: Array<string | null> = [];
    const tree = (
      <ColorSchemeProvider>
        <Probe
          onRender={(scheme) => {
            rendered.push(scheme);
          }}
        />
      </ColorSchemeProvider>
    );
    const host = document.createElement('div');
    canvasElement.append(host);
    host.innerHTML = renderToString(tree);
    await expect(host).toHaveTextContent('未定');
    rendered.length = 0;

    const root = hydrateRoot(host, tree);
    try {
      await waitFor(async () => {
        await expect(host).toHaveTextContent('dark');
      });
      await expect(rendered[0]).toBeNull();
      await expect(rendered).not.toContain('light');
    } finally {
      root.unmount();
      host.remove();
    }
  },
});
