import { DEMO_MESSAGE } from '@/shared/demo/demo-message';
import { DEMO_META_CONTENT_SECURITY_POLICY } from '@/site/security-headers';

// script は例の JS か、tsx を React ごと束ねた JS
export type DemoDocument = {
  name: string;
  html: string;
  css: string;
  script: string;
};

// どの例にも入れる下地。例の固有の見た目は記事のコードに書く
const BASE_STYLE = `:root {
  color-scheme: light dark;
  accent-color: light-dark(oklch(57.5% 0.145 180), oklch(75% 0.175 180));
}

body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

/* 例にはサイトの CSS が届かないので、@k8ordo/ui の Button（color="base"・size="sm"）と
   TextField・Select の値を写す。並べたときに端がそろうよう、高さは 2rem にそろえる。
   :where() で詳細度を 0 にし、記事のコードに書いた部品の CSS がどれも勝つようにする */
:where(
    input:is(:not([type]), [type='text'], [type='search'], [type='email'], [type='url'], [type='tel'], [type='password'], [type='number']),
    select,
    textarea
  ) {
  box-sizing: border-box;
  min-block-size: 2rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid light-dark(oklch(75% 0.005 235), oklch(52% 0.006 235));
  border-radius: 0.75rem;
  background-color: light-dark(oklch(100% 0 0), oklch(30% 0.002 235));
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

:where(input:focus-visible, select:focus-visible, textarea:focus-visible) {
  outline: 2px solid light-dark(oklch(66% 0.255 260), oklch(75% 0.21 260));
  outline-offset: 1px;
}

:where(button) {
  box-sizing: border-box;
  min-block-size: 2rem;
  padding: 0.25rem 0.75rem;
  border: 2px solid transparent;
  border-radius: 9999px;
  background-color: light-dark(oklch(95.5% 0.0015 235), oklch(25% 0.0015 235));
  color: light-dark(oklch(25% 0.0015 235), oklch(97.5% 0.001 235));
  font: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s cubic-bezier(0, 0, 0.2, 1);
}

@media (hover: hover) {
  :where(button:not(:disabled):hover) {
    background-color: light-dark(oklch(92.5% 0.003 235), oklch(42% 0.003 235));
  }
}

:where(button:not(:disabled):active) {
  background-color: light-dark(oklch(84% 0.004 235), oklch(52% 0.006 235));
}

:where(button:focus-visible) {
  outline: 2px solid light-dark(oklch(66% 0.255 260), oklch(75% 0.21 260));
  outline-offset: 2px;
}

:where(button:disabled) {
  cursor: not-allowed;
  opacity: 0.35;
}`;

// 記事から配色を受け取り、文書の高さを記事に知らせる。iframe は sandbox で origin を持たず、
// 記事の localStorage も class も読めない
const BRIDGE_SCRIPT = `const host = window.parent;

const reportHeight = () => {
  const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
  host.postMessage({ type: '${DEMO_MESSAGE.height}', height }, '*');
};

addEventListener('message', (event) => {
  if (event.source !== host || event.data?.type !== '${DEMO_MESSAGE.colorScheme}') return;
  const { colorScheme } = event.data;
  if (colorScheme === 'light' || colorScheme === 'dark') {
    document.documentElement.style.colorScheme = colorScheme;
  }
  // 記事の hydrate より先に読み終えると、ready と最初の高さは記事に届かない。記事は聞き始めると
  // 配色を送るので、そのたびに高さを知らせ直す
  reportHeight();
});

new ResizeObserver(reportHeight).observe(document.documentElement);

host.postMessage({ type: '${DEMO_MESSAGE.ready}' }, '*');`;

const assertNotClosing = (code: string, tag: string, name: string): void => {
  if (code.toLowerCase().includes(`</${tag}`)) {
    throw new Error(
      `demo="${name}" の ${tag} に </${tag} を書くと、例の文書の ${tag} がそこで閉じる`,
    );
  }
};

export const buildDemoDocument = (demo: DemoDocument): string => {
  assertNotClosing(demo.css, 'style', demo.name);
  assertNotClosing(demo.script, 'script', demo.name);
  return [
    '<!doctype html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${DEMO_META_CONTENT_SECURITY_POLICY}">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    `<title>${demo.name}</title>`,
    `<style>\n${BASE_STYLE}\n</style>`,
    ...(demo.css === '' ? [] : [`<style>\n${demo.css}\n</style>`]),
    `<script type="module">\n${BRIDGE_SCRIPT}\n</script>`,
    '</head>',
    '<body>',
    demo.html,
    ...(demo.script === ''
      ? []
      : [`<script type="module">\n${demo.script}\n</script>`]),
    '</body>',
    '</html>',
    '',
  ].join('\n');
};
