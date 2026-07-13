import type { LintLanguage } from '../application/language';

// code-dock の初期表示に使うサンプル。全訪問者共通なので page.tsx はこのコードの
// 診断結果をサーバー側でキャッシュして初期 props として渡し、クライアントはマウント
// 時の再検査を省略する。クライアントとサーバーが同じ値を参照するよう一元化する
export const DEFAULT_SAMPLE_CODE = [
  'const greeting = "Hello, k8o!"',
  '',
  'export const App = () => {',
  '  console.log(greeting)',
  '  return <p>{greeting}</p>',
  '}',
  '',
].join('\n');

export const DEFAULT_SAMPLE_LANGUAGE: LintLanguage = 'tsx';
