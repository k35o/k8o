import { mountPageUrl } from '@k8ordo/state/testing';
import type { ReactElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, waitFor } from 'storybook/test';

export const paramInUrl = (key: string): string | null =>
  new URL(location.href).searchParams.get(key);

export const queryInUrl = (): string | null => paramInUrl('q');

// @k8ordo/state は続く replace の書き込みを間引くので、値は少し遅れて URL に入る
export const expectParamInUrl = async (
  key: string,
  value: string | null,
): Promise<void> => {
  await waitFor(async () => {
    await expect(paramInUrl(key)).toBe(value);
  });
};

// Story の URL を parameters.query（q=css のような query の文字列）と parameters.hash で決める
export const mountStoryUrl = ({
  parameters,
}: {
  parameters: Record<string, unknown>;
}): (() => void) => {
  const { query, hash } = parameters;
  return mountPageUrl({
    ...(typeof query === 'string' && { search: query }),
    ...(typeof hash === 'string' && { hash }),
  });
};

// Story は描いた時から React が欄を持つので、hydrate の前に打つことが起きない。サーバーで描いた
// HTML を置き、その欄に打ってから hydrate する
export const hydrateAfterTyping = (
  canvasElement: HTMLElement,
  element: ReactElement,
  typed: string,
): { host: HTMLElement; dispose: () => void } => {
  const host = document.createElement('div');
  canvasElement.append(host);
  host.innerHTML = renderToString(element);
  const input = host.querySelector('input');
  if (input === null) {
    throw new Error('HTML に欄がありません');
  }
  input.value = typed;
  const root = hydrateRoot(host, element);
  return {
    host,
    dispose: () => {
      root.unmount();
      host.remove();
    },
  };
};
