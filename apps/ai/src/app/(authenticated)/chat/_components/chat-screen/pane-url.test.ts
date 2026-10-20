import { describe, expect, it } from 'vitest';

import {
  paneHistoryStep,
  pinnedPaneAt,
  pinnedPaneFrom,
  pushedInOf,
} from './pane-url';
import type { PaneHistoryStep } from './pane-url';

const THREAD_PATH = '/chat/thread-1';
const THREAD = `https://ai.k8o.me${THREAD_PATH}`;

const pinOf = (toolCallId: string, lastCallKey: string) =>
  ({ type: 'pinned', toolCallId, lastCallKey }) as const;

describe('pinnedPaneFrom', () => {
  describe('正常系', () => {
    it('pane と since から固定を読む', () => {
      expect(
        pinnedPaneFrom(new URLSearchParams('pane=call-a&since=call-z')),
      ).toStrictEqual({
        type: 'pinned',
        toolCallId: 'call-a',
        lastCallKey: 'call-z',
      });
    });

    it('since が無ければ、pane を最後の呼び出しとして読む', () => {
      expect(pinnedPaneFrom(new URLSearchParams('pane=call-a'))).toStrictEqual({
        type: 'pinned',
        toolCallId: 'call-a',
        lastCallKey: 'call-a',
      });
    });
  });

  describe('異常系', () => {
    it.each([
      ['検索パラメータが無い', ''],
      ['since だけがある', 'since=call-z'],
      ['pane が空', 'pane=&since=call-z'],
    ])('%sなら、固定は無い', (_label, search) => {
      expect(pinnedPaneFrom(new URLSearchParams(search))).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('since が空なら、無いものとして読む', () => {
      expect(
        pinnedPaneFrom(new URLSearchParams('pane=call-a&since=')),
      ).toStrictEqual({
        type: 'pinned',
        toolCallId: 'call-a',
        lastCallKey: 'call-a',
      });
    });
  });
});

describe('pinnedPaneAt', () => {
  describe('正常系', () => {
    it('この会話のパスでは、URL から固定を読む', () => {
      expect(
        pinnedPaneAt({
          pathname: THREAD_PATH,
          ownPath: THREAD_PATH,
          searchParams: new URLSearchParams('pane=call-a&since=call-z'),
          kept: null,
        }),
      ).toStrictEqual(pinOf('call-a', 'call-z'));
    });

    it.each([
      ['別の会話', '/chat/thread-2', ''],
      ['固定のある別の会話', '/chat/thread-2', 'pane=call-x'],
      ['新しいチャット', '/chat', ''],
      ['別のツール', '/artifacts/a1b2c3d4e5f6', 'v=2'],
    ])(
      '%sのパスにいるあいだは、URL によらず保っている固定を返す',
      (_label, pathname, search) => {
        const kept = pinOf('call-a', 'call-z');

        expect(
          pinnedPaneAt({
            pathname,
            ownPath: THREAD_PATH,
            searchParams: new URLSearchParams(search),
            kept,
          }),
        ).toBe(kept);
      },
    );

    it('この会話のパスに戻ると、保っている固定より URL に合わせる', () => {
      expect(
        pinnedPaneAt({
          pathname: THREAD_PATH,
          ownPath: THREAD_PATH,
          searchParams: new URLSearchParams(''),
          kept: pinOf('call-a', 'call-z'),
        }),
      ).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('この会話のパスで保っている固定と同じものを読むと、保っている値をそのまま返す', () => {
      const kept = pinOf('call-a', 'call-z');

      expect(
        pinnedPaneAt({
          pathname: THREAD_PATH,
          ownPath: THREAD_PATH,
          searchParams: new URLSearchParams('pane=call-a&since=call-z'),
          kept,
        }),
      ).toBe(kept);
    });

    it('この会話のパスで最後の呼び出しだけが違う固定を読むと、URL の固定に替える', () => {
      expect(
        pinnedPaneAt({
          pathname: THREAD_PATH,
          ownPath: THREAD_PATH,
          searchParams: new URLSearchParams('pane=call-a&since=call-y'),
          kept: pinOf('call-a', 'call-z'),
        }),
      ).toStrictEqual(pinOf('call-a', 'call-y'));
    });
  });
});

describe('pushedInOf', () => {
  describe('正常系', () => {
    it('印の鍵を読む', () => {
      expect(pushedInOf({ panePushedIn: 'doc-1', __NA: true })).toBe('doc-1');
    });
  });

  describe('異常系', () => {
    it.each([
      ['null', null],
      ['印の無い state', { __NA: true }],
      ['文字列でない印', { panePushedIn: 1 }],
      ['オブジェクトでない state', 'doc-1'],
    ])('%sなら、印は無い', (_label, historyState) => {
      expect(pushedInOf(historyState)).toBeNull();
    });
  });
});

describe('paneHistoryStep', () => {
  const writtenOf = (
    step: PaneHistoryStep,
  ): Extract<PaneHistoryStep, { url: string }> =>
    step !== null && step.type !== 'back'
      ? step
      : expect.unreachable('URL を書く記録になっていない');

  describe('正常系', () => {
    it('pane の無い URL で固定すると、pane を足して積み、この文書の鍵の印だけを持たせる', () => {
      expect(
        paneHistoryStep({
          href: THREAD,
          pushedIn: null,
          documentKey: 'doc-now',
          next: pinOf('call-a', 'call-z'),
        }),
      ).toStrictEqual({
        type: 'push',
        url: '/chat/thread-1?pane=call-a&since=call-z',
        state: { panePushedIn: 'doc-now' },
      });
    });

    it('pane のある URL で固定し直すと、記録を置き換え、印をそのまま引き継ぐ', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=call-a&since=call-z`,
          pushedIn: 'doc-before',
          documentKey: 'doc-now',
          next: pinOf('call-b', 'call-z'),
        }),
      ).toStrictEqual({
        type: 'replace',
        url: '/chat/thread-1?pane=call-b&since=call-z',
        state: { panePushedIn: 'doc-before' },
      });
    });

    it('この文書で積んだ記録で外すと、戻る', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=call-a`,
          pushedIn: 'doc-now',
          documentKey: 'doc-now',
          next: null,
        }),
      ).toStrictEqual({ type: 'back' });
    });
  });

  describe('異常系', () => {
    it('印の無い記録で外すと、pane と since を消して置き換え、state を持たせない', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=call-a&since=call-z`,
          pushedIn: null,
          documentKey: 'doc-now',
          next: null,
        }),
      ).toStrictEqual({ type: 'replace', url: '/chat/thread-1', state: null });
    });

    it('印の無い記録で固定し直すと、印を足さずに置き換える', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=call-a`,
          pushedIn: null,
          documentKey: 'doc-now',
          next: pinOf('call-b', 'call-b'),
        }),
      ).toStrictEqual({
        type: 'replace',
        url: '/chat/thread-1?pane=call-b',
        state: null,
      });
    });

    it('再読み込みの前に積んだ記録で外すと、戻らずに pane と since を消して置き換える', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=call-a&since=call-z`,
          pushedIn: 'doc-before',
          documentKey: 'doc-now',
          next: null,
        }),
      ).toStrictEqual({ type: 'replace', url: '/chat/thread-1', state: null });
    });

    it('pane の無い URL で外すと、何もしない', () => {
      expect(
        paneHistoryStep({
          href: THREAD,
          pushedIn: 'doc-now',
          documentKey: 'doc-now',
          next: null,
        }),
      ).toBeNull();
    });

    it('pane が空の URL で固定すると、固定の無い記録として積む', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=`,
          pushedIn: null,
          documentKey: 'doc-now',
          next: pinOf('call-a', 'call-a'),
        }),
      ).toStrictEqual({
        type: 'push',
        url: '/chat/thread-1?pane=call-a',
        state: { panePushedIn: 'doc-now' },
      });
    });
  });

  describe('エッジケース', () => {
    it('固定した呼び出しが最後なら since を省き、前の since が残っていれば消す', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?pane=call-a&since=call-z`,
          pushedIn: 'doc-now',
          documentKey: 'doc-now',
          next: pinOf('call-z', 'call-z'),
        }),
      ).toStrictEqual({
        type: 'replace',
        url: '/chat/thread-1?pane=call-z',
        state: { panePushedIn: 'doc-now' },
      });
    });

    it('パスとほかの検索パラメータとハッシュを残す', () => {
      expect(
        paneHistoryStep({
          href: `${THREAD}?q=1&pane=call-a&since=call-z#end`,
          pushedIn: null,
          documentKey: 'doc-now',
          next: null,
        }),
      ).toStrictEqual({
        type: 'replace',
        url: '/chat/thread-1?q=1#end',
        state: null,
      });
    });

    it.each([
      ['since を持つ固定', pinOf('call-a', 'call-z')],
      ['since を省く固定', pinOf('call-a', 'call-a')],
    ])('%sを書いた URL を読み直すと、同じ固定に戻る', (_label, pinned) => {
      const step = paneHistoryStep({
        href: THREAD,
        pushedIn: null,
        documentKey: 'doc-now',
        next: pinned,
      });

      expect(
        pinnedPaneFrom(new URL(writtenOf(step).url, THREAD).searchParams),
      ).toStrictEqual(pinned);
    });

    it('呼ぶたびに新しい state を返し、同じオブジェクトを使い回さない', () => {
      const input = {
        href: THREAD,
        pushedIn: null,
        documentKey: 'doc-now',
        next: pinOf('call-a', 'call-a'),
      };

      const first = writtenOf(paneHistoryStep(input));
      const second = writtenOf(paneHistoryStep(input));

      expect(first.state).not.toBe(second.state);
    });
  });
});
