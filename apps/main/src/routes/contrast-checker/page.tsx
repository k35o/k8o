import { ContrastCheckerIndex } from '@/components/contrast-checker/contrast-checker-index/contrast-checker-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function ContrastCheckerPage() {
  return (
    <>
      <PageMeta
        description="2色のコントラスト比とAPCAのLc値を計算し、WCAGの基準で評価します。"
        image={{
          path: '/contrast-checker/og.png',
          alt: 'コントラストチェッカー',
        }}
        path="/contrast-checker"
        title="コントラストチェッカー"
      />
      <ContrastCheckerIndex />
    </>
  );
}
