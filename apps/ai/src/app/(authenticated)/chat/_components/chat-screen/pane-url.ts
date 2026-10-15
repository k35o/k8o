import type { PaneSelection } from '@/features/agent/application/ui-artifacts';

export type PinnedPane = Extract<PaneSelection, { type: 'pinned' }>;

type PaneHistoryState = { panePushedIn: string };

export type PaneHistoryStep =
  | { type: 'push'; url: string; state: PaneHistoryState }
  | { type: 'replace'; url: string; state: PaneHistoryState | null }
  | { type: 'back' }
  | null;

const PANE_PARAM = 'pane';
const SINCE_PARAM = 'since';

const nonEmpty = (value: string | null): string | null =>
  value === '' ? null : value;

export const pinnedPaneFrom = (
  searchParams: URLSearchParams,
): PinnedPane | null => {
  const pane = nonEmpty(searchParams.get(PANE_PARAM));
  if (pane === null) {
    return null;
  }
  return {
    type: 'pinned',
    toolCallId: pane,
    lastCallKey: nonEmpty(searchParams.get(SINCE_PARAM)) ?? pane,
  };
};

const samePinnedPane = (a: PinnedPane | null, b: PinnedPane | null): boolean =>
  a === null || b === null
    ? a === b
    : a.toolCallId === b.toolCallId && a.lastCallKey === b.lastCallKey;

// Activity で隠れた会話の画面も、移った先の URL で描き直される。そこで固定を導き直すと、ペインの key が
// 替わって中の state が消えるので、この会話のパスにいないあいだは最後に読んだ固定を保つ。
// 呼び出し側が state に持ち直すかを参照で決められるよう、同じ固定なら保っている値をそのまま返す
export const pinnedPaneAt = ({
  pathname,
  ownPath,
  searchParams,
  kept,
}: {
  pathname: string;
  ownPath: string;
  searchParams: URLSearchParams;
  kept: PinnedPane | null;
}): PinnedPane | null => {
  if (pathname !== ownPath) {
    return kept;
  }
  const fromUrl = pinnedPaneFrom(searchParams);
  return samePinnedPane(fromUrl, kept) ? kept : fromUrl;
};

export const pushedInOf = (historyState: unknown): string | null => {
  if (
    typeof historyState !== 'object' ||
    historyState === null ||
    !('panePushedIn' in historyState)
  ) {
    return null;
  }
  return typeof historyState.panePushedIn === 'string'
    ? historyState.panePushedIn
    : null;
};

const relativeHref = (url: URL): string =>
  `${url.pathname}${url.search}${url.hash}`;

// history に渡す state は、印だけを持つ新しいオブジェクトにする。Next が差し替えた pushState と
// replaceState は、渡した state に Next の印（__NA）を書き足し、__NA のある state を内部からの
// 呼び出しとみなしてルーターに伝えない。今の history.state を広げたり使い回したりすると
// useSearchParams が変わらず、URL だけが替わる
export const paneHistoryStep = ({
  href,
  pushedIn,
  documentKey,
  next,
}: {
  href: string;
  pushedIn: string | null;
  documentKey: string;
  next: PinnedPane | null;
}): PaneHistoryStep => {
  const url = new URL(href);
  const hasPane = pinnedPaneFrom(url.searchParams) !== null;
  if (next === null) {
    if (!hasPane) {
      return null;
    }
    if (pushedIn === documentKey) {
      return { type: 'back' };
    }
    url.searchParams.delete(PANE_PARAM);
    url.searchParams.delete(SINCE_PARAM);
    return { type: 'replace', url: relativeHref(url), state: null };
  }
  url.searchParams.set(PANE_PARAM, next.toolCallId);
  if (next.lastCallKey === null || next.lastCallKey === next.toolCallId) {
    url.searchParams.delete(SINCE_PARAM);
  } else {
    url.searchParams.set(SINCE_PARAM, next.lastCallKey);
  }
  if (!hasPane) {
    return {
      type: 'push',
      url: relativeHref(url),
      state: { panePushedIn: documentKey },
    };
  }
  return {
    type: 'replace',
    url: relativeHref(url),
    state: pushedIn === null ? null : { panePushedIn: pushedIn },
  };
};
