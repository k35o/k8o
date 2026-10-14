import { describe, expect, it } from 'vitest';

import { serverSyncAfter, threadTitleFrom } from './agent-message';
import type { AgentUIMessage } from './agent-message';

const userMessage = (text: string): AgentUIMessage => ({
  id: 'u1',
  role: 'user',
  parts: [{ type: 'text', text }],
});

type ChatFinish = Parameters<typeof serverSyncAfter>[0];

// finish を受け取らずにストリームが閉じたときは finishReason が無い
const closedWithoutFinish: ChatFinish = {
  message: userMessage('こんにちは'),
  messages: [],
  isAbort: false,
  isDisconnect: false,
  isError: false,
};

const finish = (overrides: Partial<ChatFinish> = {}): ChatFinish => ({
  ...closedWithoutFinish,
  finishReason: 'stop',
  ...overrides,
});

describe('threadTitleFrom', () => {
  describe('正常系', () => {
    it('本文をそのままタイトルにする', () => {
      expect(threadTitleFrom(userMessage('ariaNotify の記事を要約して'))).toBe(
        'ariaNotify の記事を要約して',
      );
    });

    it('改行や連続する空白は1つの空白にまとめ、前後の空白を除く', () => {
      expect(threadTitleFrom(userMessage('  1行目\n\n2行目\t 3行目  '))).toBe(
        '1行目 2行目 3行目',
      );
    });
  });

  describe('エッジケース', () => {
    it('40 字を超える本文は 40 字で切り、… を付ける', () => {
      expect(threadTitleFrom(userMessage('あ'.repeat(41)))).toBe(
        `${'あ'.repeat(40)}…`,
      );
    });

    it('ちょうど 40 字の本文は切らない', () => {
      expect(threadTitleFrom(userMessage('あ'.repeat(40)))).toBe(
        'あ'.repeat(40),
      );
    });

    it('サロゲートペアの文字も 1 字と数え、途中で切らない', () => {
      expect(threadTitleFrom(userMessage('🍣'.repeat(41)))).toBe(
        `${'🍣'.repeat(40)}…`,
      );
    });
  });
});

describe('serverSyncAfter', () => {
  describe('正常系', () => {
    it('最後まで受け取れたなら、サーバーから読み直さない', () => {
      expect(serverSyncAfter(finish())).toBeNull();
    });

    it.each([
      ['停止した', { isAbort: true }],
      ['接続が切れた', { isDisconnect: true }],
    ])('%sなら、サーバーの生成が終わるまで待つ', (_label, overrides) => {
      expect(serverSyncAfter(finish(overrides))).toBe('wait');
    });

    it('エラーになったら、待たずに1回だけ確かめる', () => {
      expect(serverSyncAfter(finish({ isError: true }))).toBe('check');
    });
  });

  describe('エッジケース', () => {
    it('finish を受け取らずにストリームが閉じたなら、サーバーの生成が終わるまで待つ', () => {
      expect(serverSyncAfter(closedWithoutFinish)).toBe('wait');
    });
  });
});
