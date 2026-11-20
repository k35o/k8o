// 記事の動く例の文書の CSP で、サイトの origin を書く場所に置く値。例の文書は origin を持たず、CSP の
// 'self' は Firefox でサイトの origin に当たらないので、origin そのものを書く。origin は本番・preview・
// 手元で違うので、文書はこの値で書き出し、記事が srcdoc に入れるときに自分の origin に置き換える。
// 置き換えずに描いた文書は、どこにも当たらないこの値のままで、画像も音源も読まない
export const DEMO_ORIGIN_PLACEHOLDER = 'https://k8o-demo-origin.invalid';

export const withDemoOrigin = (document: string, origin: string): string =>
  document.replaceAll(DEMO_ORIGIN_PLACEHOLDER, origin);
