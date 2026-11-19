import { describe, expect, it } from 'vitest';

import { buildDemoDocument } from './demo-document';

describe('buildDemoDocument', () => {
  const demo = {
    name: 'dots',
    html: '<ul class="dots"></ul>',
    css: '.dots { display: flex; }',
    script: 'console.log(1);',
  };

  describe('正常系', () => {
    it('下地の後に例の CSS を置き、例の HTML と JS を body に置く', () => {
      const document = buildDemoDocument(demo);

      expect(document.startsWith('<!doctype html>')).toBe(true);
      expect(document.indexOf('color-scheme: light dark')).toBeLessThan(
        document.indexOf(demo.css),
      );
      const body = document.slice(document.indexOf('<body>'));
      expect(body).toContain(demo.html);
      expect(body).toContain(
        `<script type="module">\n${demo.script}\n</script>`,
      );
    });

    it('srcdoc に入れても制限が効くよう、頭の初めに CSP の meta を置く', () => {
      const document = buildDemoDocument(demo);
      const meta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https://k8o-demo-origin.invalid blob:; media-src https://k8o-demo-origin.invalid; base-uri 'none'; form-action 'none';">`;

      expect(document).toContain(`<head>\n<meta charset="utf-8">\n${meta}\n`);
      expect(document.indexOf(meta)).toBeLessThan(document.indexOf('<style'));
    });

    it('検索に拾わせない', () => {
      expect(buildDemoDocument(demo)).toContain(
        '<meta name="robots" content="noindex">',
      );
    });
  });

  describe('異常系', () => {
    it('CSS や script が style・script を閉じると投げる', () => {
      expect(() =>
        buildDemoDocument({ ...demo, css: 'p {} </STYLE>' }),
      ).toThrow(/style/u);
      expect(() =>
        buildDemoDocument({ ...demo, script: 'const s = "</script>";' }),
      ).toThrow(/script/u);
    });
  });

  describe('エッジケース', () => {
    it('script の無い例（HTML と CSS だけ）には例の script を置かない', () => {
      const document = buildDemoDocument({ ...demo, script: '' });

      expect(document.slice(document.indexOf('<body>'))).not.toContain(
        '<script',
      );
    });
  });
});
