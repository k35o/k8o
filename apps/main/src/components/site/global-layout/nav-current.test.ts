import { describe, expect, it } from 'vitest';

import { navCurrentOf } from './nav-current';

describe('navCurrentOf', () => {
  describe('正常系', () => {
    it('区画の入口のページでは page を返す', () => {
      expect(navCurrentOf('/blog', '/blog')).toBe('page');
    });

    it('区画の下のページでは true を返す', () => {
      expect(navCurrentOf('/blog/scope', '/blog')).toBe('true');
    });

    it('ほかの区画のページでは何も返さない', () => {
      expect(navCurrentOf('/talks', '/blog')).toBeUndefined();
    });
  });

  describe('エッジケース', () => {
    it('名前の頭が同じだけの別のページでは何も返さない', () => {
      expect(navCurrentOf('/blog-archive', '/blog')).toBeUndefined();
    });

    it('ホームでは何も返さない', () => {
      expect(navCurrentOf('/', '/blog')).toBeUndefined();
    });
  });
});
