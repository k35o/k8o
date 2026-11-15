import { DEMO_MESSAGE } from '@/shared/demo/demo-message';

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
}

body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
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
