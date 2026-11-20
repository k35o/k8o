import type { Plugin, ViteDevServer } from 'vite';

// 記事の動く例だけが使う画像と音源（public/demos/<slug>/）。例の文書は origin を持たず、サイトの
// ファイルはどれも別の origin のものになる。canvas に描いて読み出す例（PNG にしてコピーする例）は、
// CORS で読んだ画像でないと canvas が汚れて読み出せないので、どの origin にも読ませる。置くのは
// 公開の静的なファイルだけ
export const DEMO_ASSETS = '/demos/';

export const DEMO_ASSETS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

type Middlewares = ViteDevServer['middlewares'];

const allowAnyOrigin = (middlewares: Middlewares): void => {
  middlewares.use((request, response, next) => {
    if (request.url?.startsWith(DEMO_ASSETS) === true) {
      for (const [name, value] of Object.entries(DEMO_ASSETS_HEADERS)) {
        response.setHeader(name, value);
      }
    }
    next();
  });
};

// vercel() の規則は Vercel だけが当てるので、dev と preview ではここで付ける。Vite の cors は手元の
// origin にしか答えず、origin を持たない例（Origin: null）には頭を返さない
export const demoAssetsCors: Plugin = {
  name: 'k8o:demo-assets-cors',
  configureServer(server) {
    allowAnyOrigin(server.middlewares);
  },
  configurePreviewServer(server) {
    allowAnyOrigin(server.middlewares);
  },
};
