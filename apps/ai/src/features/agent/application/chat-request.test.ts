import { describe, expect, it } from 'vitest';

import { parseChatRequest } from './chat-request';

const THREAD_ID = '0b9c6f3e-5a4e-4f7a-9d0e-2f6b1c3a8e71';

const body = (overrides: Record<string, unknown> = {}): unknown => ({
  threadId: THREAD_ID,
  trigger: 'submit-message',
  message: {
    id: 'u1',
    role: 'user',
    parts: [{ type: 'text', text: '要約して' }],
  },
  ...overrides,
});

describe('parseChatRequest', () => {
  describe('正常系', () => {
    it('テキストだけの user メッセージを受け、本文だけから組み直す', async () => {
      await expect(
        parseChatRequest(
          body({
            model: 'claude-opus-5-5',
            message: {
              id: 'u1',
              role: 'user',
              metadata: { end: 'completed' },
              parts: [{ type: 'text', text: '要約して', state: 'done' }],
            },
          }),
        ),
      ).resolves.toStrictEqual({
        threadId: THREAD_ID,
        model: 'claude-opus-5-5',
        message: {
          id: 'u1',
          role: 'user',
          parts: [{ type: 'text', text: '要約して' }],
        },
      });
    });

    it('model が無ければ undefined のまま返す', async () => {
      await expect(parseChatRequest(body())).resolves.toMatchObject({
        model: undefined,
      });
    });

    it('テキストの part が複数あれば、改行でつないで1つにする', async () => {
      await expect(
        parseChatRequest(
          body({
            message: {
              id: 'u1',
              role: 'user',
              parts: [
                { type: 'text', text: '1つ目' },
                { type: 'text', text: '2つ目' },
              ],
            },
          }),
        ),
      ).resolves.toMatchObject({
        message: { parts: [{ type: 'text', text: '1つ目\n2つ目' }] },
      });
    });
  });

  describe('異常系', () => {
    it.each([
      [
        'assistant のメッセージ',
        body({
          message: {
            id: 'a1',
            role: 'assistant',
            parts: [{ type: 'text', text: '要約です' }],
          },
        }),
      ],
      [
        'file の part を持つメッセージ',
        body({
          message: {
            id: 'u1',
            role: 'user',
            parts: [
              { type: 'text', text: '見て' },
              {
                type: 'file',
                mediaType: 'image/png',
                url: 'https://example.com/a.png',
              },
            ],
          },
        }),
      ],
      [
        'tool の part を持つメッセージ',
        body({
          message: {
            id: 'u1',
            role: 'user',
            parts: [
              {
                type: 'tool-list_blogs',
                toolCallId: 'c1',
                state: 'input-available',
                input: {},
              },
            ],
          },
        }),
      ],
      [
        '空白だけの本文',
        body({
          message: {
            id: 'u1',
            role: 'user',
            parts: [{ type: 'text', text: ' \n ' }],
          },
        }),
      ],
      [
        'part の無いメッセージ',
        body({ message: { id: 'u1', role: 'user', parts: [] } }),
      ],
      ['メッセージの無い本文', body({ message: undefined })],
      ['壊れたメッセージ', body({ message: { role: 'user' } })],
      ['regenerate', body({ trigger: 'regenerate-message' })],
      ['UUID でない threadId', body({ threadId: 'thread-1' })],
      ['知らない model', body({ model: 'claude-haiku-4-5' })],
      ['オブジェクトでない本文', 'hello'],
    ])('%s は null にする', async (_label, input) => {
      await expect(parseChatRequest(input)).resolves.toBeNull();
    });
  });
});
