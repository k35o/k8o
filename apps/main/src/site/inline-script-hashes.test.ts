import { describe, expect, it } from 'vitest';

import { inlineScriptHashes } from './inline-script-hashes.ts';

describe('inlineScriptHashes', () => {
  describe('正常系', () => {
    it('文書の inline の script ごとに、中身の sha256 を CSP のソースの形で並べる', () => {
      const html = [
        '<head><script type="module">\nconsole.log(1);\n</script></head>',
        '<body><p>例</p><script>\nconst a = 1;\n</script></body>',
      ].join('\n');

      expect(inlineScriptHashes(html)).toStrictEqual([
        "'sha256-6ylx2nk61t31O3rHPzQZfJJkryyz5Ldd+rHtiDdohm0='",
        "'sha256-QcIhsjk61gkOVILWlo+LCNguF/M5h3uV4o9FA6/oftc='",
      ]);
    });
  });

  describe('エッジケース', () => {
    it('script の無い文書は空', () => {
      expect(inlineScriptHashes('<style>p {}</style><p>例</p>')).toStrictEqual(
        [],
      );
    });

    it('ブラウザが改行を LF にそろえてから求めるので、CRLF と CR も LF として求める', () => {
      expect(
        inlineScriptHashes('<script>a\r\nb</script><script>a\rb</script>'),
      ).toStrictEqual([
        "'sha256-fhj3NzEbLcOy8mndeDlrA1HxT7Zu+oefdoyyMYGIPHg='",
        "'sha256-fhj3NzEbLcOy8mndeDlrA1HxT7Zu+oefdoyyMYGIPHg='",
      ]);
    });
  });
});
