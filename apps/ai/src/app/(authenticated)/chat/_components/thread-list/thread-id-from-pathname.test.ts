import { describe, expect, it } from 'vitest';

import { threadIdFromPathname } from './thread-id-from-pathname';

describe('threadIdFromPathname', () => {
  describe('正常系', () => {
    it('スレッドの画面なら、そのスレッドの ID を返す', () => {
      expect(
        threadIdFromPathname('/chat/6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01'),
      ).toBe('6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01');
    });

    it('新しいチャットの画面なら、今のスレッドは無い', () => {
      expect(threadIdFromPathname('/chat')).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['ほかのツール', '/slides'],
      ['ID の無い末尾のスラッシュ', '/chat/'],
      ['スレッドより深いパス', '/chat/abc/def'],
      ['chat で始まる別のパス', '/chatroom/abc'],
    ])('%sなら、今のスレッドは無い', (_label, pathname) => {
      expect(threadIdFromPathname(pathname)).toBeNull();
    });
  });
});
