import type { ReactElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

export const queryInUrl = (): string | null =>
  new URL(location.href).searchParams.get('q');

// q を URLSearchParams で書き直すと %20 が + になるので、渡された綴りのまま足す
const replaceQuery = (query: string): void => {
  const url = new URL(location.href);
  url.searchParams.delete('q');
  url.search = [url.search.slice(1), query].filter(Boolean).join('&');
  history.replaceState(history.state, '', url);
};

// Storybook には Navigation API を拾う router が無く、q を書く navigate がそのままでは iframe を
// 読み込み直すので、同じ文書の navigate を止める。Story は同じページで続けて走るので、URL の q は
// Story の前後で parameters.query（無ければ無し）に戻す
export const interceptUrlNavigation = ({
  parameters,
}: {
  parameters: Record<string, unknown>;
}): (() => void) => {
  replaceQuery(
    typeof parameters['query'] === 'string' ? parameters['query'] : '',
  );
  const intercept = (event: NavigateEvent): void => {
    if (
      event.canIntercept &&
      new URL(event.destination.url).pathname === location.pathname
    ) {
      event.intercept();
    }
  };
  navigation.addEventListener('navigate', intercept);
  return () => {
    navigation.removeEventListener('navigate', intercept);
    replaceQuery('');
  };
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
