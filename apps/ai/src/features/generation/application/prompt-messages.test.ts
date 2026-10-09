import type { UIMessage } from 'ai';

import { stripDataParts } from './prompt-messages';

const message = (
  role: UIMessage['role'],
  parts: UIMessage['parts'],
): UIMessage => ({ id: role, role, parts });

describe('stripDataParts', () => {
  describe('正常系', () => {
    it('data パーツを落とし、会話文の text だけを残す', () => {
      const result = stripDataParts([
        message('assistant', [
          { type: 'text', text: 'タイトル: ログイン画面' },
          { type: 'data-spec', data: { op: 'add' } },
        ]),
      ]);

      expect(result[0]?.parts).toStrictEqual([
        { type: 'text', text: 'タイトル: ログイン画面' },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('パッチ行を分けたあとに残る空白だけの text を落とす', () => {
      const result = stripDataParts([
        message('assistant', [
          { type: 'text', text: 'タイトル: ログイン画面' },
          { type: 'data-spec', data: { op: 'add' } },
          { type: 'text', text: '\n' },
        ]),
      ]);

      expect(result[0]?.parts).toStrictEqual([
        { type: 'text', text: 'タイトル: ログイン画面' },
      ]);
    });
  });
});
