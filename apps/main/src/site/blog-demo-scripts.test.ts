import { fileURLToPath } from 'node:url';

import { parseSync } from 'vite';
import { describe, expect, it } from 'vitest';

import { bundleDemoScript } from './blog-demo-scripts.ts';

const options = {
  root: fileURLToPath(new URL('../..', import.meta.url)),
  target: ['chrome120'],
};

const bundle = async (tsx: string): Promise<string> =>
  bundleDemoScript({ tsx, label: 'demo="test"' }, options);

describe('bundleDemoScript', () => {
  describe('正常系', () => {
    it('export default の部品を、本番版の React ごと import の無い 1 本の JS に束ねる', async () => {
      const code = await bundle(
        [
          "import { useState } from 'react';",
          '',
          'export default function App() {',
          '  const [count, setCount] = useState(0);',
          '  return <button onClick={() => setCount(count + 1)}>{count}</button>;',
          '}',
        ].join('\n'),
      );

      expect(
        parseSync('demo.js', code).program.body.map(({ type }) => type),
      ).not.toContain('ImportDeclaration');
      expect(code).not.toContain('process.env');
      expect(code).not.toContain('react.development');
      expect(code).toContain('createRoot');
    }, 60_000);

    it('束ねた JS は、例の文書の script を閉じる </script を持たない', async () => {
      const code = await bundle(
        'export default function App() { return <p>{"</script>"}</p>; }',
      );

      expect(code.toLowerCase()).not.toContain('</script');
    }, 60_000);
  });

  describe('異常系', () => {
    it('react と react-dom のほかを import すると投げる', async () => {
      await expect(
        bundle(
          "import { sleep } from '@repo/helpers/sleep';\nexport default function App() { void sleep(1); return null; }",
        ),
      ).rejects.toThrow(/react と react-dom だけ/u);
    }, 60_000);
  });
});
