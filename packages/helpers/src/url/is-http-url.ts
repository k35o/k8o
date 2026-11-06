// 多層防御: api の値に不正なスキームの URL が混入しても javascript: 等をリンク化しない
export const isHttpUrl = (value: string): boolean => {
  if (!URL.canParse(value)) {
    return false;
  }
  const { protocol } = new URL(value);
  return protocol === 'https:' || protocol === 'http:';
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('isHttpUrl', () => {
    describe('正常系', () => {
      it('https と http の URL を許可する', () => {
        expect(isHttpUrl('https://k8o.me/reading-list')).toBe(true);
        expect(isHttpUrl('http://example.com/')).toBe(true);
      });
    });

    describe('異常系', () => {
      it('script と data のスキームを拒否する', () => {
        // oxlint-disable-next-line eslint/no-script-url -- 拒否することを確かめる値
        expect(isHttpUrl('javascript:alert(1)')).toBe(false);
        expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(
          false,
        );
      });

      it('URL として不正な文字列を拒否する', () => {
        expect(isHttpUrl('/reading-list')).toBe(false);
        expect(isHttpUrl('')).toBe(false);
      });
    });

    describe('エッジケース', () => {
      it('大文字や前後の空白を含むスキームも URL の解釈どおりに扱う', () => {
        expect(isHttpUrl('HTTPS://k8o.me/')).toBe(true);
        expect(isHttpUrl(' javascript:alert(1)')).toBe(false);
      });
    });
  });
}
